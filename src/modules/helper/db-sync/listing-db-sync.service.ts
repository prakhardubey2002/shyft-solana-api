import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
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
				event.listState
			);
			await this.listingRepo.insert(listing);
		} catch (err) {
			console.log(err);
		}
	}

	@OnEvent('listing.sold', { async: true })
	async handleListingSoldEvent(event: ListingSoldEvent): Promise<any> {
		try {
			await this.listingRepo.markSold(event.network, event.listState, event.buyerAddress, event.purchasedAt);
		} catch (err) {
			console.log(err);
		}
	}

	@OnEvent('listing.cancelled', { async: true })
	async handleListingCancelledEvent(event: ListingCancelledEvent): Promise<any> {
		try {
			const cancel_time = new Date(event.cancelledAt);
			await this.listingRepo.updateCancelledAt(event.network, event.listState, cancel_time);
		} catch (err) {
			console.log(err)
		}
	}
}