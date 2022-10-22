import {
  findAssociatedTokenAccountPda,
  findAuctionHouseFeePda,
  findAuctionHousePda,
  findAuctionHouseTreasuryPda,
  Metaplex,
  toBigNumber,
  toPublicKey,
} from '@metaplex-foundation/js';
import {
  CreateAuctionHouseInstructionAccounts,
  CreateAuctionHouseInstructionArgs,
  createCreateAuctionHouseInstruction,
  createUpdateAuctionHouseInstruction,
  createWithdrawFromTreasuryInstruction,
  UpdateAuctionHouseInstructionAccounts,
  UpdateAuctionHouseInstructionArgs,
  WithdrawFromTreasuryInstructionAccounts,
} from '@metaplex-foundation/mpl-auction-house';
import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ObjectId } from 'mongoose';
import { Utility } from 'src/common/utils/utils';
import { newProgramError, newProgramErrorFrom, ProgramError } from 'src/core/program-error';
import { MarketplaceInitiationEvent, MarketplaceUpdateInitiationEvent } from '../data-cache/db-sync/db.events';
import { CreateMarketPlaceDto } from './dto/create-mp.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';
import { DetachedMarketPlaceResponseDto, DetachedUpdatedMarketplaceResponseDto } from './response-dto/responses.dto';
import { isEqual } from 'lodash';
import { WithdrawFeeDto } from './dto/withdraw-royalty.dto';
import { MarketplaceRepo } from 'src/dal/marketplace-repo/marketplace-repo';

class CreateMarketplaceServiceDto {
  apiKeyId: ObjectId;
  params: CreateMarketPlaceDto;
}

export type UpdateMpSerivceDto = {
  apiKeyId: ObjectId;
  params: UpdateMarketplaceDto;
};

@Injectable()
export class MarketplaceDetachedService {
  constructor(private eventEmitter: EventEmitter2, private marketplaceRepo: MarketplaceRepo) {}
  async createMarketPlace(createMarketPlaceDto: CreateMarketplaceServiceDto) {
    try {
      const connection = Utility.connectRpc(createMarketPlaceDto.params.network);
      const wallet = toPublicKey(createMarketPlaceDto.params.creator_wallet);
      const canChangeSalePrice = false;
      const requiresSignOff = false;

      // Accounts.
      const authority = createMarketPlaceDto.params.authority_address ?? createMarketPlaceDto.params.creator_wallet;
      const treasuryMint = createMarketPlaceDto.params.currency_address
        ? toPublicKey(createMarketPlaceDto.params.currency_address)
        : NATIVE_MINT;
      const treasuryWithdrawalDestinationOwner = toPublicKey(
        createMarketPlaceDto.params.fee_recipient ?? createMarketPlaceDto.params.creator_wallet,
      );
      const feeWithdrawalDestination = toPublicKey(
        createMarketPlaceDto.params.fee_payer ?? createMarketPlaceDto.params.creator_wallet,
      );

      // PDAs.
      const auctionHouse = findAuctionHousePda(toPublicKey(authority), treasuryMint);
      const auctionHouseFeeAccount = findAuctionHouseFeePda(auctionHouse);
      const auctionHouseTreasury = findAuctionHouseTreasuryPda(auctionHouse);
      const treasuryWithdrawalDestination = treasuryMint.equals(NATIVE_MINT)
        ? treasuryWithdrawalDestinationOwner
        : findAssociatedTokenAccountPda(treasuryMint, treasuryWithdrawalDestinationOwner);
      const currencySymbol = await Utility.token.getTokenSymbol(
        createMarketPlaceDto.params.network,
        treasuryMint.toBase58(),
      );

      const accounts: CreateAuctionHouseInstructionAccounts = {
        treasuryMint: treasuryMint,
        payer: wallet,
        authority: toPublicKey(authority),
        feeWithdrawalDestination: feeWithdrawalDestination,
        treasuryWithdrawalDestination: treasuryWithdrawalDestination,
        treasuryWithdrawalDestinationOwner: treasuryWithdrawalDestinationOwner,
        auctionHouse: auctionHouse,
        auctionHouseFeeAccount: auctionHouseFeeAccount,
        auctionHouseTreasury: auctionHouseTreasury,
      };

      const transactionFee = createMarketPlaceDto.params.transaction_fee ?? 2;

      const args: CreateAuctionHouseInstructionArgs = {
        bump: auctionHouse.bump,
        feePayerBump: auctionHouseFeeAccount.bump,
        treasuryBump: auctionHouseTreasury.bump,
        sellerFeeBasisPoints: transactionFee * 100,
        requiresSignOff,
        canChangeSalePrice,
      };

      this.eventEmitter.emit(
        'marketplace.creation.initiated',
        new MarketplaceInitiationEvent(
          createMarketPlaceDto.params.network,
          auctionHouse.toBase58(),
          createMarketPlaceDto.apiKeyId,
          treasuryWithdrawalDestinationOwner.toBase58(),
        ),
      );

      const instruction = createCreateAuctionHouseInstruction(accounts, args);
      const txt = new Transaction().add(instruction);
      txt.feePayer = wallet;
      txt.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      const serializedTransaction = txt.serialize({
        requireAllSignatures: false,
        verifySignatures: true,
      });
      const transactionBase64 = serializedTransaction.toString('base64');

      const resp: DetachedMarketPlaceResponseDto = {
        network: createMarketPlaceDto.params.network,
        address: auctionHouse.toBase58(),
        fee_account: auctionHouseFeeAccount.toBase58(),
        treasury_address: auctionHouseTreasury.toBase58(),
        fee_payer: feeWithdrawalDestination.toBase58(),
        fee_recipient: treasuryWithdrawalDestinationOwner.toBase58(),
        fee_recipient_account: treasuryWithdrawalDestination.toBase58(),
        currency_address: treasuryMint.toBase58(),
        currency_symbol: currencySymbol,
        creator: authority,
        transaction_fee: transactionFee,
        authority: authority,
        encoded_transaction: transactionBase64,
      };
      return resp;
    } catch (err) {
      throw newProgramErrorFrom(err, 'mp_creation_error');
    }
  }

  async updateMarketplace(updateMarketplaceDto: UpdateMpSerivceDto) {
    try {
      const connection = Utility.connectRpc(updateMarketplaceDto.params.network);
      const wallet = toPublicKey(updateMarketplaceDto.params.authority_wallet);

      const auctionHouseAddress = toPublicKey(updateMarketplaceDto.params.marketplace_address);
      const auctionHouse = await Utility.auctionHouse.findAuctionHouse(
        updateMarketplaceDto.params.network,
        auctionHouseAddress,
      );

      let treasuryWithdrawalDestinationOwner: PublicKey;
      let treasuryWithdrawalDestination: PublicKey;

      if (auctionHouse.isNative) {
        treasuryWithdrawalDestinationOwner = updateMarketplaceDto.params.fee_recipient
          ? toPublicKey(updateMarketplaceDto.params.fee_recipient)
          : auctionHouse.treasuryWithdrawalDestinationAddress;
        treasuryWithdrawalDestination = treasuryWithdrawalDestinationOwner;
      } else if (updateMarketplaceDto.params.fee_recipient) {
        treasuryWithdrawalDestinationOwner = toPublicKey(updateMarketplaceDto.params.fee_recipient);
        treasuryWithdrawalDestination = findAssociatedTokenAccountPda(
          auctionHouse.treasuryMint.address,
          treasuryWithdrawalDestinationOwner,
        );
      } else {
        const treasuryDestinationOwner = await this.marketplaceRepo.getMarketplaceTreasuryDestinationOwner(
          updateMarketplaceDto.params.network,
          auctionHouseAddress.toBase58(),
        );
        if (treasuryDestinationOwner === undefined) {
          throw newProgramError(
            'missing_params',
            HttpStatus.BAD_REQUEST,
            'You are trying to update a Marketplace which uses a custom token as currency. ' +
              'You have not provided the "fee_receipient" because you do not wish to change it. ' +
              'However, the Marketplace account does not keep track of that information so we cannot prefill that for you. ' +
              'Plus, this marketplace was not created using Shyft API therefore we also have not record of the fee_recipient' +
              'Thus, if you wish to keep the same fee_receipient, you must provide it explicilty.',
            '',
            'mp_detached_service_update_marketplace',
            {
              input_params: updateMarketplaceDto.params,
            },
          );
        }
        treasuryWithdrawalDestinationOwner = toPublicKey(treasuryDestinationOwner);
        treasuryWithdrawalDestination = findAssociatedTokenAccountPda(
          auctionHouse.treasuryMint.address,
          treasuryWithdrawalDestinationOwner,
        );
      }

      const originalData = {
        authority: auctionHouse.authorityAddress,
        feeWithdrawalDestination: auctionHouse.feeWithdrawalDestinationAddress,
        treasuryWithdrawalDestination: auctionHouse.treasuryWithdrawalDestinationAddress,
        sellerFeeBasisPoints: auctionHouse.sellerFeeBasisPoints,
        requiresSignOff: auctionHouse.requiresSignOff,
        canChangeSalePrice: auctionHouse.canChangeSalePrice,
      };

      const updatedData = {
        authority: updateMarketplaceDto.params.new_authority_address
          ? toPublicKey(updateMarketplaceDto.params.new_authority_address)
          : originalData.authority,
        feeWithdrawalDestination: updateMarketplaceDto.params.fee_payer
          ? toPublicKey(updateMarketplaceDto.params.fee_payer)
          : originalData.feeWithdrawalDestination,
        treasuryWithdrawalDestination,
        sellerFeeBasisPoints: updateMarketplaceDto.params.transaction_fee
          ? updateMarketplaceDto.params.transaction_fee * 100
          : originalData.sellerFeeBasisPoints,
        requiresSignOff: originalData.requiresSignOff,
        canChangeSalePrice: originalData.canChangeSalePrice,
      };

      const shouldSendUpdateInstruction = !isEqual(originalData, updatedData);
      if (!shouldSendUpdateInstruction) {
        throw newProgramError(
          'no_update_error',
          HttpStatus.BAD_REQUEST,
          'No difference between original and new marketplace, cannot execute the instruction',
          '',
          'mp-detached-service_updateMarketplace',
          {
            original_auction_house: originalData,
            updated_auction_house: updatedData,
          },
        );
      }

      const account: UpdateAuctionHouseInstructionAccounts = {
        treasuryMint: auctionHouse.treasuryMint.address,
        payer: wallet,
        authority: wallet,
        newAuthority: updatedData.authority,
        feeWithdrawalDestination: updatedData.feeWithdrawalDestination,
        treasuryWithdrawalDestination: treasuryWithdrawalDestination,
        treasuryWithdrawalDestinationOwner: treasuryWithdrawalDestinationOwner,
        auctionHouse: auctionHouse.address,
      };

      const args: UpdateAuctionHouseInstructionArgs = {
        sellerFeeBasisPoints: updateMarketplaceDto.params.transaction_fee
          ? updateMarketplaceDto.params.transaction_fee * 100
          : null,
        requiresSignOff: null,
        canChangeSalePrice: null,
      };

      const instruction = createUpdateAuctionHouseInstruction(account, args);
      const txt = new Transaction().add(instruction);
      txt.feePayer = wallet;
      txt.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      const serializedTransaction = txt.serialize({
        requireAllSignatures: false,
        verifySignatures: true,
      });
      const transactionBase64 = serializedTransaction.toString('base64');

      const event: MarketplaceUpdateInitiationEvent = {
        network: updateMarketplaceDto.params.network,
        address: auctionHouse.address.toBase58(),
        apiKeyId: updateMarketplaceDto.apiKeyId,
        feeRecipient: treasuryWithdrawalDestinationOwner.toBase58(),
      };
      this.eventEmitter.emit('marketplace.update.initiated', event);

      const resp: DetachedUpdatedMarketplaceResponseDto = {
        network: updateMarketplaceDto.params.network,
        address: auctionHouse.address.toBase58(),
        fee_account: auctionHouse.feeAccountAddress.toBase58(),
        treasury_address: auctionHouse.treasuryAccountAddress.toBase58(),
        fee_payer: updatedData.feeWithdrawalDestination.toBase58(),
        fee_recipient: treasuryWithdrawalDestinationOwner.toBase58(),
        fee_recipient_account: treasuryWithdrawalDestination.toBase58(),
        currency_address: auctionHouse.treasuryMint.address.toBase58(),
        transaction_fee: updatedData.sellerFeeBasisPoints / 100,
        authority: updatedData.authority.toBase58(),
        encoded_transaction: transactionBase64,
      };
      return resp;
    } catch (err) {
      throw err;
    }
  }

  async withdrawFee(withdrawRoyaltyDto: WithdrawFeeDto): Promise<any> {
    try {
      const executor = toPublicKey(withdrawRoyaltyDto.authority_wallet);
      const connection = Utility.connectRpc(withdrawRoyaltyDto.network);
      const metaplex = Metaplex.make(connection, {
        cluster: withdrawRoyaltyDto.network,
      });
      const auctionsClient = metaplex.auctions();
      const auctionHouse = await auctionsClient
        .findAuctionHouseByAddress(new PublicKey(withdrawRoyaltyDto.marketplace_address))
        .run();

      if (executor.toBase58() != auctionHouse.authorityAddress.toBase58()) {
        throw newProgramError(
          'withdrawFee_Unauthorized_withdrawal',
          HttpStatus.FORBIDDEN,
          'only the marketplace authority is allowed to withdraw funds from the marketplace',
          '',
          'mp-service_withdrawFee',
          {
            withdrawer_address: executor.toBase58(),
            authority_address: auctionHouse.authorityAddress.toBase58(),
          },
        );
      }

      const instructionAccounts: WithdrawFromTreasuryInstructionAccounts = {
        treasuryMint: auctionHouse.treasuryMint.address,
        authority: auctionHouse.authorityAddress,
        treasuryWithdrawalDestination: auctionHouse.treasuryWithdrawalDestinationAddress,
        auctionHouseTreasury: auctionHouse.treasuryAccountAddress,
        auctionHouse: auctionHouse.address,
      };
      const withdrawAmount = toBigNumber(withdrawRoyaltyDto.amount * Math.pow(10, auctionHouse.treasuryMint.decimals));

      const instruction = createWithdrawFromTreasuryInstruction(instructionAccounts, { amount: withdrawAmount });
      const txt = new Transaction().add(instruction);
      txt.feePayer = executor;
      txt.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      const serializedTransaction = txt.serialize({
        requireAllSignatures: false,
        verifySignatures: true,
      });
      const transactionBase64 = serializedTransaction.toString('base64');
      return {
        from: auctionHouse.treasuryAccountAddress.toBase58(),
        to: auctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
        amount: withdrawRoyaltyDto.amount,
        encoded_transaction: transactionBase64,
      };
    } catch (err) {
      if (err instanceof ProgramError) {
        throw err;
      } else {
        throw newProgramErrorFrom(err, 'mp_withdraw_fee_error');
      }
    }
  }
}
