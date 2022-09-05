import { amount, findAuctionHouseTradeStatePda, keypairIdentity, Metaplex, toBigNumber, toPublicKey, token, findAssociatedTokenAccountPda, Pda } from "@metaplex-foundation/js";
import { NodeWallet } from "@metaplex/js";
import { Injectable } from "@nestjs/common";
import { clusterApiUrl, Connection, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, Transaction } from "@solana/web3.js";
import { AccountUtils } from "src/common/utils/account-utils";
import { BuyAttachedDto } from "./dto/buy-listed.dto";
import { UnlistAttachedDto } from "./dto/cancel-listing.dto";
import { ListAttachedDto } from "./dto/create-list.dto";
import {
	CancelInstructionAccounts,
	createCancelListingReceiptInstruction,
	createCancelInstruction,
} from '@metaplex-foundation/mpl-auction-house';
import { GetListingDetailsDto } from "./dto/get-listing-details.dto";
import { ListingCancelledEvent, ListingCreatedEvent, ListingSoldEvent } from "../helper/db-sync/db.events";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GetListingsDto } from "./dto/get-listings.dto";
import { ListingRepo } from "src/dal/listing-repo/listing-repo";
import { GetSellerListingsDto } from "./dto/get-seller-listings.dto";
import { GetPurchasesDto } from "./dto/get-purchases.dto";
import { ObjectId } from "mongoose";
import { PurchasesDto, SellerListingsDto, ActiveListingsResultDto, BuyResponseDto, ListingCreationResponseDto, ListingInfoResponseDto } from "./response-dto/responses.dto";
import { newProgramErrorFrom } from "src/core/program-error";
import { Utility } from "src/common/utils/utils";
import { GetStatsDto } from "./dto/get-stats.dto";

class CreateListingServiceDto {
	apiKeyId: ObjectId;
	createListingParams: ListAttachedDto;
}

@Injectable()
export class ListingService {
	constructor(private eventEmitter: EventEmitter2, private listingRepo: ListingRepo) { }
	async createListing(createListDto: CreateListingServiceDto): Promise<any> {
		try {
			const sellerKp = AccountUtils.getKeypair(createListDto.createListingParams.private_key);
			const wallet = new NodeWallet(sellerKp);
			const connection = new Connection(clusterApiUrl(createListDto.createListingParams.network), 'confirmed');
			const metaplex = Metaplex.make(connection, { cluster: createListDto.createListingParams.network }).use(keypairIdentity(sellerKp));
			const auctionsClient = metaplex.auctions();
			const auctionHouse = await auctionsClient.findAuctionHouseByAddress(new PublicKey(createListDto.createListingParams.marketplace_address)).run();

			const auctionCurrency = auctionHouse.treasuryMint;
			const currencySymbol = await Utility.token.getTokenSymbol(createListDto.createListingParams.network, auctionHouse.treasuryMint.address.toBase58());
			const { listing } = await auctionsClient.for(auctionHouse).list({
				seller: wallet.publicKey,
				mintAccount: new PublicKey(createListDto.createListingParams.nft_address),
				price: {
					currency: auctionCurrency.currency,
					basisPoints: toBigNumber(createListDto.createListingParams.price * Math.pow(10, auctionCurrency.decimals))
				},
				printReceipt: true,
				bookkeeper: wallet.payer
			}).run();

			const listingCreatedEvent = new ListingCreatedEvent(
				listing.tradeStateAddress.toBase58(),
				listing.auctionHouse.address.toBase58(),
				createListDto.createListingParams.price,
				listing.asset.address.toBase58(),
				listing.sellerAddress.toBase58(),
				createListDto.apiKeyId,
				createListDto.createListingParams.network,
				listing.receiptAddress.toBase58(),
				listing.createdAt,
				currencySymbol,
			);
			this.eventEmitter.emit('listing.created', listingCreatedEvent);

			const result: ListingCreationResponseDto = {
				network: createListDto.createListingParams.network,
				marketplace_address: listing.auctionHouse.address.toBase58(),
				seller_address: listing.sellerAddress.toBase58(),
				price: createListDto.createListingParams.price,
				nft_address: listing.asset.address.toBase58(),
				list_state: listing.tradeStateAddress.toBase58(),
				currency_symbol: currencySymbol,
				receipt: listing.receiptAddress.toBase58(),
			};

			return result;
		} catch (err) {
			throw newProgramErrorFrom(err, "listing_creation_error");
		}
	}

	async buy(buyDto: BuyAttachedDto): Promise<any> {
		try {
			const buyerKp = AccountUtils.getKeypair(buyDto.private_key);
			const wallet = new NodeWallet(buyerKp);
			const connection = new Connection(clusterApiUrl(buyDto.network), 'confirmed');
			const metaplex = Metaplex.make(connection, { cluster: buyDto.network }).use(keypairIdentity(buyerKp));
			const auctionsClient = metaplex.auctions();
			const auctionHouse = await auctionsClient.findAuctionHouseByAddress(new PublicKey(buyDto.marketplace_address)).run();

			const auctionCurrency = auctionHouse.treasuryMint;
			const offerPrice = amount(toBigNumber(buyDto.price * Math.pow(10, auctionCurrency.decimals)), auctionCurrency.currency)

			const tokenAccount = findAssociatedTokenAccountPda(toPublicKey(buyDto.nft_address), toPublicKey(buyDto.seller_address));

			const sellerTradeState = findAuctionHouseTradeStatePda(
				auctionHouse.address,
				toPublicKey(buyDto.seller_address),
				auctionHouse.treasuryMint.address,
				toPublicKey(buyDto.nft_address),
				offerPrice.basisPoints,
				token(1).basisPoints,
				tokenAccount
			);

			const auctionHouseClient = auctionsClient.for(auctionHouse);
			const listing = await auctionHouseClient.findListingByAddress(sellerTradeState).run();

			const { bid } = await auctionHouseClient.bid({
				buyer: wallet.payer,
				mintAccount: toPublicKey(buyDto.nft_address),
				seller: toPublicKey(buyDto.seller_address),
				price: offerPrice
			}).run();

			const { purchase } = await auctionHouseClient.executeSale({
				listing: listing,
				bid: bid,
			}).run()

			const listingSoldEvent = new ListingSoldEvent(
				sellerTradeState.toBase58(),
				bid.buyerAddress.toBase58(),
				buyDto.network,
				purchase.createdAt,
				purchase.receiptAddress.toBase58(),
			);
			this.eventEmitter.emit('listing.sold', listingSoldEvent);

			const currencySymbol = await Utility.token.getTokenSymbol(buyDto.network, auctionHouse.treasuryMint.address.toBase58());
			const result: BuyResponseDto = {
				network: buyDto.network,
				marketplace_address: listing.auctionHouse.address.toBase58(),
				seller_address: listing.sellerAddress.toBase58(),
				price: buyDto.price,
				nft_address: listing.asset.address.toBase58(),
				currency_symbol: currencySymbol,
				purchase_receipt: purchase.receiptAddress.toBase58(),
				buyer_address: purchase.buyerAddress.toBase58(),
				purchased_at: new Date(purchase.createdAt.toNumber() * 1000)
			}
			return {
				purchase: result,
			}
		} catch (err) {
			console.log(err);
			throw newProgramErrorFrom(err, "listing_buy_error");
		}
	}

	async findListing(getListingDetailsDto: GetListingDetailsDto): Promise<any> {
		try {
			const connection = new Connection(clusterApiUrl(getListingDetailsDto.network), 'confirmed');
			const metaplex = Metaplex.make(connection, { cluster: getListingDetailsDto.network })
			const auctionsClient = metaplex.auctions();
			const auctionHouse = await auctionsClient.findAuctionHouseByAddress(new PublicKey(getListingDetailsDto.marketplace_address)).run();

			const auctionHouseClient = auctionsClient.for(auctionHouse);
			const listing = await auctionHouseClient.findListingByAddress(toPublicKey(getListingDetailsDto.list_state)).run();

			const price = listing.price.basisPoints.toNumber() / Math.pow(10, listing.price.currency.decimals);
			const currencySymbol = await Utility.token.getTokenSymbol(getListingDetailsDto.network, auctionHouse.treasuryMint.address.toBase58());
			const result: ListingInfoResponseDto = {
				network: getListingDetailsDto.network,
				marketplace_address: listing.auctionHouse.address.toBase58(),
				seller_address: listing.sellerAddress.toBase58(),
				price: price,
				nft_address: listing.asset.address.toBase58(),
				list_state: listing.tradeStateAddress.toBase58(),
				currency_symbol: currencySymbol,
				created_at: new Date(listing.createdAt.toNumber() * 1000),
			}
			if (listing.receiptAddress != null) {
				result.receipt = listing.receiptAddress.toBase58();
			}
			if (listing.purchaseReceiptAddress != null) {
				result.purchase_receipt = listing.purchaseReceiptAddress.toBase58();
			}
			if (listing.canceledAt != null) {
				result.cancelled_at = new Date(listing.canceledAt.toNumber() * 1000)
			}
			return result;
		} catch (error) {
			throw newProgramErrorFrom(error, "get_listing_error");
		}
	}

	async cancelListing(cancelListingDto: UnlistAttachedDto): Promise<any> {
		try {
			const sellerKp = AccountUtils.getKeypair(cancelListingDto.private_key);
			const wallet = new NodeWallet(sellerKp);
			const connection = new Connection(clusterApiUrl(cancelListingDto.network), 'confirmed');
			const metaplex = Metaplex.make(connection, { cluster: cancelListingDto.network }).use(keypairIdentity(sellerKp));
			const auctionsClient = metaplex.auctions();
			const auctionHouse = await auctionsClient.findAuctionHouseByAddress(new PublicKey(cancelListingDto.marketplace_address)).run();

			const auctionHouseClient = auctionsClient.for(auctionHouse);
			const listing = await auctionHouseClient.findListingByAddress(toPublicKey(cancelListingDto.list_state)).run();

			const accounts: CancelInstructionAccounts = {
				wallet: listing.sellerAddress,
				tokenAccount: listing.asset.token.address,
				tokenMint: listing.asset.address,
				authority: auctionHouse.authorityAddress,
				auctionHouse: auctionHouse.address,
				auctionHouseFeeAccount: auctionHouse.feeAccountAddress,
				tradeState: toPublicKey(cancelListingDto.list_state),
			};

			const buyerPrice = listing.price.basisPoints;
			const tokenBasisPoints = listing.tokens.basisPoints;
			const args = {
				buyerPrice,
				tokenSize: tokenBasisPoints
			};

			const cancelInstruction = createCancelInstruction(accounts, args);
			const cancelListingReceiptInstruction = createCancelListingReceiptInstruction({
				receipt: listing.receiptAddress as Pda,
				instruction: SYSVAR_INSTRUCTIONS_PUBKEY,
			});

			const txt = new Transaction().add(cancelInstruction).add(cancelListingReceiptInstruction);
			txt.feePayer = wallet.publicKey;
			txt.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
			const signedTx = await wallet.signTransaction(txt);
			const txId = await connection.sendRawTransaction(signedTx.serialize());

			const listingCancelledEvnet = new ListingCancelledEvent(
				cancelListingDto.list_state,
				cancelListingDto.network,
				new Date()
			);
			this.eventEmitter.emit('listing.cancelled', listingCancelledEvnet);

			return {
				transaction_id: txId
			};
		} catch (err) {
			throw newProgramErrorFrom(err, "cancel_listing_error");
		}
	}

	async getActiveListings(getListingDto: GetListingsDto): Promise<ActiveListingsResultDto[]> {
		try {
			const dataSet = await this.listingRepo.getActiveListings(getListingDto.network, getListingDto.marketplace_address);
			const result = dataSet.map(listing => {
				const acl: ActiveListingsResultDto = {
					network: listing.network,
					marketplace_address: listing.marketplace_address,
					seller_address: listing.seller_address,
					price: listing.price,
					currency_symbol: listing.currency_symbol,
					nft_address: listing.nft_address,
					list_state: listing.list_state,
					created_at: listing.created_at,
				}
				if (listing.receipt_address != null) {
					acl.receipt = listing.receipt_address
				}
				return acl;
			});
			return result;
		} catch (err) {
			throw newProgramErrorFrom(err, "get_active_listings_error");
		}
	}

	async getActiveSellers(getListingDto: GetListingsDto): Promise<string[]> {
		try {
			const dataSet = await this.listingRepo.getActiveListings(getListingDto.network, getListingDto.marketplace_address);
			let sellerMap = new Map<string, boolean>();
			let result: string[] = [];
			dataSet.map(d => {
				if (!sellerMap.has(d.seller_address)) {
					sellerMap.set(d.seller_address, true);
					result.push(d.seller_address)
				}
			})
			return result;
		} catch (err) {
			throw newProgramErrorFrom(err, "get_active_sellers_error");
		}
	}

	async getSellerListings(getListingDto: GetSellerListingsDto): Promise<SellerListingsDto[]> {
		try {
			const dataSet = await this.listingRepo.getSellerListings(getListingDto.network, getListingDto.marketplace_address, getListingDto.seller_address);
			const result = dataSet.map(listing => {
				const acl: SellerListingsDto = {
					network: listing.network,
					marketplace_address: listing.marketplace_address,
					seller_address: listing.seller_address,
					price: listing.price,
					nft_address: listing.nft_address,
					currency_symbol: listing.currency_symbol,
					buyer_address: listing.buyer_address,
					created_at: listing.created_at,
					list_state: listing.list_state,
					purchased_at: listing.purchased_at,
					purchase_receipt: listing.purchase_receipt_address,
					receipt: listing.receipt_address,
					cancelled_at: listing.cancelled_at,
				}
				return acl;
			});
			return result;
		} catch (err) {
			throw newProgramErrorFrom(err, "get_seller_listings_error");
		}
	}

	async getPurchases(getPurchasesDto: GetPurchasesDto): Promise<PurchasesDto[]> {
		try {
			const dataSet = await this.listingRepo.getOrders(getPurchasesDto.network, getPurchasesDto.marketplace_address, getPurchasesDto.buyer_address);
			const result = dataSet.map(listing => {
				const purchases: PurchasesDto = {
					network: listing.network,
					marketplace_address: listing.marketplace_address,
					seller_address: listing.seller_address,
					price: listing.price,
					nft_address: listing.nft_address,
					buyer_address: listing.buyer_address,
					purchase_receipt: listing.purchase_receipt_address,
					created_at: listing.created_at,
					purchased_at: listing.purchased_at,
				}
				return purchases;
			});
			return result;
		} catch (err) {
			throw newProgramErrorFrom(err, "get_purchases_error");
		}
	}

	async stats(getStatsDto: GetStatsDto): Promise<any> {
		try {
			const result = await this.listingRepo.stats(getStatsDto);
			return result;
		} catch (err) {
			throw newProgramErrorFrom(err, 'no_data_found');
		}
	}
}
