import {
  amount,
  findAssociatedTokenAccountPda,
  findAuctionHouseBuyerEscrowPda,
  findAuctionHouseProgramAsSignerPda,
  findAuctionHouseTradeStatePda,
  findBidReceiptPda,
  findListingReceiptPda,
  findMetadataPda,
  findPurchaseReceiptPda,
  lamports,
  Metaplex,
  toBigNumber,
  token,
  toPublicKey,
} from '@metaplex-foundation/js';
import {
  BuyInstructionAccounts,
  BuyInstructionArgs,
  CancelInstructionAccounts,
  createBuyInstruction,
  createCancelInstruction,
  createCancelListingReceiptInstruction,
  createExecuteSaleInstruction,
  createPrintBidReceiptInstruction,
  createPrintListingReceiptInstruction,
  createPrintPurchaseReceiptInstruction,
  createSellInstruction,
  ExecuteSaleInstructionAccounts,
  ExecuteSaleInstructionArgs,
  PrintBidReceiptInstructionAccounts,
  PrintBidReceiptInstructionArgs,
  PrintListingReceiptInstructionAccounts,
  PrintListingReceiptInstructionArgs,
  PrintPurchaseReceiptInstructionAccounts,
  PrintPurchaseReceiptInstructionArgs,
  SellInstructionAccounts,
  SellInstructionArgs,
} from '@metaplex-foundation/mpl-auction-house';
import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction } from '@solana/web3.js';
import { ObjectId } from 'mongoose';
import { Utility } from 'src/common/utils/utils';
import { newProgramError, newProgramErrorFrom } from 'src/core/program-error';
import {
  ListingInitiationEvent,
  SaleInitiationEvent,
  SaleInitWithServiceChargeEvent,
  UnlistInitiationEvent,
} from '../data-cache/db-sync/db.events';
import { BuyDto } from './dto/buy-listed.dto';
import { UnlistDto } from './dto/cancel-listing.dto';
import { ListDto } from './dto/create-list.dto';
import { DetachedCreateListingResponseDto } from './response-dto/responses.dto';

class CreateListingServiceDto {
  apiKeyId: ObjectId;
  params: ListDto;
}

@Injectable()
export class ListingDetachedService {
  constructor(private eventEmitter: EventEmitter2) {}
  async createListing(createListDto: CreateListingServiceDto): Promise<any> {
    try {
      const connection = Utility.connectRpc(createListDto.params.network);
      const seller = toPublicKey(createListDto.params.seller_wallet);

      const metaplex = Metaplex.make(connection, {
        cluster: createListDto.params.network,
      });
      const auctionsClient = metaplex.auctions();
      const auctionHouse = await auctionsClient
        .findAuctionHouseByAddress(toPublicKey(createListDto.params.marketplace_address))
        .run();

      const mintAccount = toPublicKey(createListDto.params.nft_address);
      const tokenAccount = findAssociatedTokenAccountPda(mintAccount, seller);
      const metadata = findMetadataPda(mintAccount);

      const auctionCurrency = auctionHouse.treasuryMint;
      const offerPrice = amount(
        toBigNumber(createListDto.params.price * Math.pow(10, auctionCurrency.decimals)),
        auctionCurrency.currency,
      );
      const sellerTradeState = findAuctionHouseTradeStatePda(
        auctionHouse.address,
        seller,
        auctionHouse.treasuryMint.address,
        mintAccount,
        offerPrice.basisPoints,
        token(1).basisPoints,
        tokenAccount,
      );
      const freeSellerTradeState = findAuctionHouseTradeStatePda(
        auctionHouse.address,
        toPublicKey(seller),
        auctionHouse.treasuryMint.address,
        mintAccount,
        lamports(0).basisPoints,
        token(1).basisPoints,
        tokenAccount,
      );
      const programAsSigner = findAuctionHouseProgramAsSignerPda();

      const accounts: SellInstructionAccounts = {
        wallet: seller,
        tokenAccount: tokenAccount,
        metadata: metadata,
        authority: auctionHouse.authorityAddress,
        auctionHouse: auctionHouse.address,
        auctionHouseFeeAccount: auctionHouse.feeAccountAddress,
        sellerTradeState: sellerTradeState,
        freeSellerTradeState,
        programAsSigner,
      };

      const args: SellInstructionArgs = {
        tradeStateBump: sellerTradeState.bump,
        freeTradeStateBump: freeSellerTradeState.bump,
        programAsSignerBump: programAsSigner.bump,
        buyerPrice: offerPrice.basisPoints,
        tokenSize: token(1).basisPoints,
      };

      const bookkeeper = seller;
      const receipt = findListingReceiptPda(sellerTradeState);
      const printAccounts: PrintListingReceiptInstructionAccounts = {
        receipt: receipt,
        bookkeeper: bookkeeper,
        instruction: SYSVAR_INSTRUCTIONS_PUBKEY,
      };
      const pArgs: PrintListingReceiptInstructionArgs = {
        receiptBump: receipt.bump,
      };

      const sellInstruction = createSellInstruction(accounts, args);
      const printListingReceiptInstruction = createPrintListingReceiptInstruction(printAccounts, pArgs);

      const txt = new Transaction().add(sellInstruction).add(printListingReceiptInstruction);

      if (createListDto.params.service_charge) {
        const txnServiceCharge = await Utility.account.addSeviceChargeOnTransaction(
          connection,
          new Transaction(),
          createListDto.params.service_charge,
          seller,
        );
        txt.add(txnServiceCharge);
      }

      txt.feePayer = seller;
      txt.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      const serializedTransaction = txt.serialize({
        requireAllSignatures: false,
        verifySignatures: true,
      });
      console.log('create existing txn size', serializedTransaction.length);
      const transactionBase64 = serializedTransaction.toString('base64');

      const currencySymbol = await Utility.token.getTokenSymbol(
        createListDto.params.network,
        auctionHouse.treasuryMint.address.toBase58(),
      );
      const resp: DetachedCreateListingResponseDto = {
        network: createListDto.params.network,
        marketplace_address: createListDto.params.marketplace_address,
        seller_address: seller.toBase58(),
        price: createListDto.params.price,
        nft_address: createListDto.params.nft_address,
        list_state: sellerTradeState.toBase58(),
        currency_symbol: currencySymbol,
        encoded_transaction: transactionBase64,
      };

      const listingInitiationEvent = new ListingInitiationEvent(
        createListDto.params.network,
        sellerTradeState,
        auctionHouse.address,
        createListDto.apiKeyId,
      );
      this.eventEmitter.emit('listing.creation.initiated', listingInitiationEvent);
      return resp;
    } catch (err) {
      throw newProgramErrorFrom(err, 'detached_listing_creation_error');
    }
  }

  async buy(buyDto: BuyDto): Promise<any> {
    try {
      if (buyDto.service_charge) {
        return await this.buyWithServiceCharge(buyDto);
      } else {
        return await this.buySimple(buyDto);
      }
    } catch (err) {
      throw newProgramErrorFrom(err, 'detached_listing_buy_error');
    }
  }

  private async buySimple(buyDto: BuyDto): Promise<any> {
    const {
      buyerTradeState,
      buyer,
      listing,
      buyInstruction,
      executeSaleInstruction,
      connection,
      sellerTradeState,
      currencySymbol,
    } = await this.createBuyExecutionEntities(buyDto);

    const txt = new Transaction();

    const {
      printBidReceiptInstruction,
      printPurchaseReceiptInstruction,
      purchaseReceipt: saleReceipt,
    } = this.getPrintReceiptInstructions(buyerTradeState, buyer, listing);
    txt
      .add(buyInstruction)
      .add(printBidReceiptInstruction)
      .add(executeSaleInstruction)
      .add(printPurchaseReceiptInstruction);
    const purchaseReceipt = saleReceipt;

    txt.feePayer = buyer;
    txt.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
    const serializedTransaction = txt.serialize({
      requireAllSignatures: false,
      verifySignatures: true,
    });
    console.log('existing txn size', serializedTransaction.length);
    const transactionBase64 = serializedTransaction.toString('base64');

    const saleInitiationEvent = new SaleInitiationEvent(
      buyDto.network,
      buyDto.nft_address,
      sellerTradeState,
      buyerTradeState,
    );
    this.eventEmitter.emit('listing.sale.initiated', saleInitiationEvent);

    const resp = {
      network: buyDto.network,
      marketplace_address: buyDto.marketplace_address,
      seller_address: buyDto.seller_address,
      price: buyDto.price,
      nft_address: buyDto.nft_address,
      purchase_receipt: purchaseReceipt,
      currecy_symbol: currencySymbol,
      buyer_address: buyer.toBase58(),
      encoded_transaction: transactionBase64,
    };
    return resp;
  }

  private async buyWithServiceCharge(buyDto: BuyDto): Promise<any> {
    const {
      buyerTradeState,
      buyer,
      buyInstruction,
      executeSaleInstruction,
      connection,
      sellerTradeState,
      currencySymbol,
    } = await this.createBuyExecutionEntities(buyDto);

    let txt = new Transaction();

    txt = new Transaction().add(buyInstruction).add(executeSaleInstruction);
    const txnServiceCharge = await Utility.account.addSeviceChargeOnTransaction(
      connection,
      new Transaction(),
      buyDto.service_charge,
      buyer,
    );
    txt.add(txnServiceCharge);
    txt.feePayer = buyer;
    txt.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
    const serializedTransaction = txt.serialize({
      requireAllSignatures: false,
      verifySignatures: true,
    });
    console.log('existing txn size', serializedTransaction.length);
    const transactionBase64 = serializedTransaction.toString('base64');

    const saleWithScEvent = new SaleInitWithServiceChargeEvent(
      buyDto.network,
      buyDto.nft_address,
      sellerTradeState,
      buyerTradeState,
      buyer,
    );
    this.eventEmitter.emit('listing.sc.sale.initiated', saleWithScEvent);

    const resp = {
      network: buyDto.network,
      marketplace_address: buyDto.marketplace_address,
      seller_address: buyDto.seller_address,
      price: buyDto.price,
      nft_address: buyDto.nft_address,
      currecy_symbol: currencySymbol,
      buyer_address: buyer.toBase58(),
      encoded_transaction: transactionBase64,
    };

    return resp;
  }

  private async createBuyExecutionEntities(buyDto: BuyDto) {
    const connection = Utility.connectRpc(buyDto.network);
    const buyer = toPublicKey(buyDto.buyer_wallet);
    const seller = toPublicKey(buyDto.seller_address);
    const metaplex = Metaplex.make(connection, { cluster: buyDto.network });
    const auctionsClient = metaplex.auctions();
    const auctionHouse = await auctionsClient.findAuctionHouseByAddress(toPublicKey(buyDto.marketplace_address)).run();

    // bid creation
    const auctionCurrency = auctionHouse.treasuryMint;
    const offerPrice = amount(
      toBigNumber(buyDto.price * Math.pow(10, auctionCurrency.decimals)),
      auctionCurrency.currency,
    );
    const paymentAccount = auctionHouse.isNative
      ? buyer
      : findAssociatedTokenAccountPda(auctionHouse.treasuryMint.address, buyer);
    const mintAccount = toPublicKey(buyDto.nft_address);
    const tokenAccount = findAssociatedTokenAccountPda(mintAccount, seller);
    const metadata = findMetadataPda(mintAccount);
    const escrowPayment = findAuctionHouseBuyerEscrowPda(auctionHouse.address, buyer);
    const buyerTradeState = findAuctionHouseTradeStatePda(
      auctionHouse.address,
      buyer,
      auctionCurrency.address,
      mintAccount,
      offerPrice.basisPoints,
      token(1).basisPoints,
      tokenAccount,
    );
    console.log('buyerTradeState : ', buyerTradeState.toBase58());

    const accounts: BuyInstructionAccounts = {
      wallet: buyer,
      paymentAccount: paymentAccount,
      transferAuthority: buyer,
      treasuryMint: auctionCurrency.address,
      tokenAccount: tokenAccount,
      metadata: metadata,
      escrowPaymentAccount: escrowPayment,
      authority: auctionHouse.authorityAddress,
      auctionHouse: auctionHouse.address,
      auctionHouseFeeAccount: auctionHouse.feeAccountAddress,
      buyerTradeState,
    };

    const args: BuyInstructionArgs = {
      tradeStateBump: buyerTradeState.bump,
      escrowPaymentBump: escrowPayment.bump,
      buyerPrice: offerPrice.basisPoints,
      tokenSize: token(1).basisPoints,
    };

    const buyInstruction = createBuyInstruction(accounts, args);

    // sale execution
    const sellerTradeState = findAuctionHouseTradeStatePda(
      auctionHouse.address,
      seller,
      auctionCurrency.address,
      mintAccount,
      offerPrice.basisPoints,
      token(1).basisPoints,
      tokenAccount,
    );
    const listing = await auctionsClient.for(auctionHouse).findListingByAddress(sellerTradeState).run();

    if (listing.canceledAt) {
      throw newProgramError(
        'canceled_listing_is_not_allowed',
        HttpStatus.NO_CONTENT,
        'You are trying to execute a sale using a canceled Listing.' +
          'Please provide a Listing that is not cancelld in order to execute the sale.',
        '',
        'listing-detached-service_buy',
        {
          cancelled_listing_state: sellerTradeState.toBase58(),
        },
      );
    }

    // Accounts.
    const sellerPaymentReceiptAccount = auctionHouse.isNative
      ? seller
      : findAssociatedTokenAccountPda(auctionHouse.treasuryMint.address, seller);
    const buyerReceiptTokenAccount = findAssociatedTokenAccountPda(listing.asset.address, buyer);

    const freeTradeState = findAuctionHouseTradeStatePda(
      auctionHouse.address,
      seller,
      auctionHouse.treasuryMint.address,
      listing.asset.address,
      lamports(0).basisPoints,
      token(1).basisPoints,
      listing.asset.token.address,
    );
    const programAsSigner = findAuctionHouseProgramAsSignerPda();

    const exsAccounts: ExecuteSaleInstructionAccounts = {
      buyer: buyer,
      seller: seller,
      tokenAccount: listing.asset.token.address,
      tokenMint: listing.asset.address,
      metadata: listing.asset.metadataAddress,
      treasuryMint: auctionHouse.treasuryMint.address,
      escrowPaymentAccount: escrowPayment,
      sellerPaymentReceiptAccount,
      buyerReceiptTokenAccount,
      authority: auctionHouse.authorityAddress,
      auctionHouse: auctionHouse.address,
      auctionHouseFeeAccount: auctionHouse.feeAccountAddress,
      auctionHouseTreasury: auctionHouse.treasuryAccountAddress,
      buyerTradeState: buyerTradeState,
      sellerTradeState: listing.tradeStateAddress,
      freeTradeState,
      programAsSigner,
    };

    // Args.
    const exsArgs: ExecuteSaleInstructionArgs = {
      freeTradeStateBump: freeTradeState.bump,
      escrowPaymentBump: escrowPayment.bump,
      programAsSignerBump: programAsSigner.bump,
      buyerPrice: offerPrice.basisPoints,
      tokenSize: token(1).basisPoints,
    };

    // Execute Sale Instruction
    const executeSaleInstruction = createExecuteSaleInstruction(exsAccounts, exsArgs);

    // Provide additional keys to pay royalties.
    listing.asset.creators.forEach(({ address }) => {
      executeSaleInstruction.keys.push({
        pubkey: address,
        isWritable: true,
        isSigner: false,
      });

      // Provide ATA to receive SPL token royalty if is not native SOL sale.
      if (!auctionHouse.isNative) {
        executeSaleInstruction.keys.push({
          pubkey: findAssociatedTokenAccountPda(auctionHouse.treasuryMint.address, address),
          isWritable: true,
          isSigner: false,
        });
      }
    });

    const currencySymbol = await Utility.token.getTokenSymbol(
      buyDto.network,
      auctionHouse.treasuryMint.address.toBase58(),
    );

    return {
      buyerTradeState,
      buyer,
      listing,
      buyInstruction,
      executeSaleInstruction,
      connection,
      sellerTradeState,
      currencySymbol,
    };
  }

  private getPrintReceiptInstructions(buyerTradeState, buyer: PublicKey, listing) {
    const purchaseReceipt = findPurchaseReceiptPda(listing.tradeStateAddress, buyerTradeState);
    const bidReceipt = findBidReceiptPda(buyerTradeState);
    const pbAccounts: PrintBidReceiptInstructionAccounts = {
      receipt: bidReceipt,
      bookkeeper: buyer,
      instruction: SYSVAR_INSTRUCTIONS_PUBKEY,
    };
    const pbArgs: PrintBidReceiptInstructionArgs = {
      receiptBump: bidReceipt.bump,
    };
    const printBidReceiptInstruction = createPrintBidReceiptInstruction(pbAccounts, pbArgs);

    const psAccounts: PrintPurchaseReceiptInstructionAccounts = {
      purchaseReceipt: purchaseReceipt,
      listingReceipt: listing.receiptAddress,
      bidReceipt: bidReceipt,
      bookkeeper: buyer,
      instruction: SYSVAR_INSTRUCTIONS_PUBKEY,
    };
    const psArgs: PrintPurchaseReceiptInstructionArgs = {
      purchaseReceiptBump: purchaseReceipt.bump,
    };
    const printPurchaseReceiptInstruction = createPrintPurchaseReceiptInstruction(psAccounts, psArgs);
    return { printBidReceiptInstruction, printPurchaseReceiptInstruction, purchaseReceipt };
  }

  async cancelListing(unlistDto: UnlistDto) {
    try {
      const executor = toPublicKey(unlistDto.seller_wallet);
      const connection = Utility.connectRpc(unlistDto.network);
      const metaplex = Metaplex.make(connection, {
        cluster: unlistDto.network,
      });
      const auctionsClient = metaplex.auctions();
      const auctionHouse = await auctionsClient
        .findAuctionHouseByAddress(toPublicKey(unlistDto.marketplace_address))
        .run();
      const listing = await auctionsClient
        .for(auctionHouse)
        .findListingByAddress(toPublicKey(unlistDto.list_state))
        .run();

      const accounts: CancelInstructionAccounts = {
        wallet: listing.sellerAddress,
        tokenAccount: listing.asset.token.address,
        tokenMint: listing.asset.address,
        authority: auctionHouse.authorityAddress,
        auctionHouse: auctionHouse.address,
        auctionHouseFeeAccount: auctionHouse.feeAccountAddress,
        tradeState: toPublicKey(unlistDto.list_state),
      };

      const buyerPrice = listing.price.basisPoints;
      const tokenBasisPoints = listing.tokens.basisPoints;
      const args = {
        buyerPrice,
        tokenSize: tokenBasisPoints,
      };

      const cancelInstruction = createCancelInstruction(accounts, args);
      const cancelListingReceiptInstruction = createCancelListingReceiptInstruction({
        receipt: listing.receiptAddress,
        instruction: SYSVAR_INSTRUCTIONS_PUBKEY,
      });

      const txt = new Transaction().add(cancelInstruction).add(cancelListingReceiptInstruction);
      txt.feePayer = executor;
      txt.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      const serializedTransaction = txt.serialize({
        requireAllSignatures: false,
        verifySignatures: true,
      });
      const transactionBase64 = serializedTransaction.toString('base64');

      const event = new UnlistInitiationEvent(unlistDto.network, listing.tradeStateAddress);
      this.eventEmitter.emit('listing.unlist.initiated', event);

      return {
        encoded_transaction: transactionBase64,
      };
    } catch (err) {
      throw newProgramErrorFrom(err, 'detached_unlist_error');
    }
  }
}
