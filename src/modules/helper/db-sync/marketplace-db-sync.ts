import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MarketplaceRepo } from "src/dal/marketplace-repo/marketplace-repo";
import { MarketPlace } from "src/dal/marketplace-repo/marketplace.schema";
import { MarketplaceCreationEvent } from "./db.events";

@Injectable()
export class MarketplaceDbSyncService {
	constructor(private marketplaceRepo: MarketplaceRepo) { }
	@OnEvent('marketplace.created', { async: true })
	async handleListingCreatedEvent(event: MarketplaceCreationEvent): Promise<any> {
		try {
			const marketplace = new MarketPlace(
				event.apiKeyId,
				event.network,
				event.address,
				event.currency
			);

			await this.marketplaceRepo.insert(marketplace);
		} catch (err) {
			console.log(err);
		}
	}
}