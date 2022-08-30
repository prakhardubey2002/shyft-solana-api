import { findListingReceiptPda, findPurchaseReceiptPda, Metaplex, toDateTime, toListingReceiptAccount, toPublicKey, toPurchaseReceiptAccount } from "@metaplex-foundation/js";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { Utility } from "src/common/utils/utils";
import { newProgramErrorFrom } from "src/core/program-error";
import { ListingRepo } from "src/dal/listing-repo/listing-repo";
import { Listing } from "src/dal/listing-repo/listing.schema";
import { ListingCancelledEvent, ListingCreatedEvent, ListingInitiationEvent, ListingSoldEvent, SaleInitiationEvent, UnlistInitiationEvent } from "./db.events";

@Injectable()
export class ListingDbSyncService {
	constructor(private listingRepo: ListingRepo) { }
	@OnEvent('listing.created', { async: true })
	async handleListingCreatedEvent(event: ListingCreatedEvent): Promise<any> {
		try {
			const listing = new Listing(
				event.apiKeyId,
				event.network,
				event.marketplaceAddress,
				event.sellerAddress,
				event.price,
				event.nftAddress,
				event.listState,
				event.createdAt,
				event.receipt,
				event.currency_symbol
			);
			await this.listingRepo.insert(listing);
		} catch (err) {
			newProgramErrorFrom(err, "listing_db_insert").log();
		}
	}

	@OnEvent('listing.sold', { async: true })
	async handleListingSoldEvent(event: ListingSoldEvent): Promise<any> {
		try {
			await this.listingRepo.markSold(event.network, event.listState, event.buyerAddress, event.purchasedAt, event.purchaseReceipt);
		} catch (err) {
			newProgramErrorFrom(err, "listing_db_mark_sold").log();
		}
	}

	@OnEvent('listing.cancelled', { async: true })
	async handleListingCancelledEvent(event: ListingCancelledEvent): Promise<any> {
		try {
			const cancelTime = new Date(event.cancelledAt);
			await this.listingRepo.updateCancelledAt(event.network, event.listState, cancelTime);
		} catch (err) {
			newProgramErrorFrom(err, "listing_db_mark_cancelled").log();
		}
	}

	@OnEvent('listing.creation.initiated', { async: true })
	async handleListingCreationInitiationEvent(event: ListingInitiationEvent): Promise<any> {

		setTimeout(async () => {
			try {
				const connection = new Connection(clusterApiUrl(event.network), 'confirmed');
				const metaplex = Metaplex.make(connection, { cluster: event.network });
				const auctionsClient = metaplex.auctions();
				const auctionHouse = await auctionsClient.findAuctionHouseByAddress(event.auctionHouseAddress).run();
				const listing = await auctionsClient.for(auctionHouse).findListingByAddress(event.listState).run();
				const price = listing.price.basisPoints.toNumber() / Math.pow(10, listing.price.currency.decimals);
				const currencySymbol = await Utility.token.getTokenSymbol(event.network, auctionHouse.treasuryMint.address.toBase58());
				const dbListing = new Listing(
					event.apiKeyId,
					event.network,
					event.auctionHouseAddress.toBase58(),
					listing.sellerAddress.toBase58(),
					price,
					listing.asset.address.toBase58(),
					listing.tradeStateAddress.toBase58(),
					listing.createdAt,
					listing.receiptAddress.toBase58(),
					currencySymbol,
					listing.canceledAt,
				);
				await this.listingRepo.insert(dbListing);
			} catch (error) {
				const err = newProgramErrorFrom(error);
				if (!err.name.includes("account_not_found")) {
					err.log();
				} else {
					console.log("listing not created, listState: ", event.listState.toBase58());
				}
			}
		}, 20000);
	}

	@OnEvent('listing.unlist.initiated', { async: true })
	async handleUnlistInitiationEvent(event: UnlistInitiationEvent): Promise<any> {
		setTimeout(async () => {
			const receiptAddress = findListingReceiptPda(event.listState);
			const connection = new Connection(clusterApiUrl(event.network), 'confirmed');
			const metaplex = Metaplex.make(connection);
			const account = toListingReceiptAccount(
				await metaplex.rpc().getAccount(receiptAddress)
			);
			let cancelledAt;
			if (account.data.canceledAt != null) {
				cancelledAt = new Date(toDateTime(account.data.canceledAt).toNumber() * 1000);
				this.listingRepo.updateCancelledAt(event.network, event.listState.toBase58(), cancelledAt);
				console.log("listing cancelled");
			}
		}, 20000);
	}

	@OnEvent('listing.sale.initiated', { async: true })
	async handleSaleInitiationEvent(event: SaleInitiationEvent): Promise<any> {
		setTimeout(async () => {
			try {
				const connection = new Connection(clusterApiUrl(event.network), 'confirmed');
				const metaplex = Metaplex.make(connection);
				const receiptAddress = findPurchaseReceiptPda(
					event.listState,
					event.bidState
				);
				const account = toPurchaseReceiptAccount(
					await metaplex.rpc().getAccount(receiptAddress)
				);

				if (account != null) {
					const createdAt = toDateTime(account.data.createdAt);
					const buyer = account.data.buyer.toBase58();
					const purchaseReceipt = account.publicKey.toBase58();
					this.listingRepo.markSold(event.network, event.listState.toBase58(), buyer, createdAt, purchaseReceipt);
					console.log("listing cancelled");
				}
			} catch (error) {
				console.log(error);
				const err = newProgramErrorFrom(error);
				if (!err.name.includes("account_not_found")) {
					err.log();
				} else {
					console.log("listing not bought, listState: ", event.listState.toBase58());
				}
			}
		}, 20000);
	}
}