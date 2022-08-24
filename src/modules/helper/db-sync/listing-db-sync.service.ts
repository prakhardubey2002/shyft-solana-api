import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { newProgramErrorFrom } from "src/core/program-error";
import { ListingRepo } from "src/dal/listing-repo/listing-repo";
import { Listing } from "src/dal/listing-repo/listing.schema";
import { ListingCancelledEvent, ListingCreatedEvent, ListingSoldEvent } from "./db.events";

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
}