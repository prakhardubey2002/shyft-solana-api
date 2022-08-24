import { HttpStatus, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { newProgramError } from "src/core/program-error";
import { MarketplaceRepo } from "src/dal/marketplace-repo/marketplace-repo";
import { MarketPlace } from "src/dal/marketplace-repo/marketplace.schema";
import { MarketplaceCreationEvent, UpdateMarketplaceEvent } from "./db.events";

@Injectable()
export class MarketplaceDbSyncService {
	constructor(private marketplaceRepo: MarketplaceRepo) { }
	@OnEvent('marketplace.created', { async: true })
	async handleMarketplaceCreationEvent(event: MarketplaceCreationEvent): Promise<any> {
		const marketplace = new MarketPlace(
			event.apiKeyId,
			event.network,
			event.address,
			event.currencyAddress,
			event.feePayer,
			event.feeRecipient,
			event.feeHolderAccount,
			event.transactionFee,
			event.creator,
			event.currencySymbol,
			event.authority,
			event.canChangeSalePrice,
			event.requiresSignOff,
		);
		try {
			await this.marketplaceRepo.insert(marketplace);
		} catch (err) {
			const pe = newProgramError("mp_db_insert", HttpStatus.AMBIGUOUS, "failed to insert the marketplace in database", err, "handleMarketplaceCreationEvent", { marketplace: marketplace })
			pe.log();
		}
	}

	@OnEvent('marketplace.updated', { async: true })
	async handleMarketplaceUpdateEvent(event: UpdateMarketplaceEvent): Promise<any> {
		const updatedMarketplace = new MarketPlace();
		updatedMarketplace.address = event.address;
		updatedMarketplace.currency_address = event.currencyAddress;
		updatedMarketplace.currency_symbol = event.currencySymbol;
		updatedMarketplace.fee_payer = event.feePayer;
		updatedMarketplace.fee_receipeint = event.feeRecipient;
		updatedMarketplace.transaction_fee = event.transactionFee;
		updatedMarketplace.can_change_sale_price = event.canChangeSalePrice;
		updatedMarketplace.requires_sign_off = event.requiresSignOff;
		updatedMarketplace.authority = event.authority;
		updatedMarketplace.api_key_id = event.apiKeyId;
		updatedMarketplace.creator = event.creator;
		try {
			await this.marketplaceRepo.updateMarketplace(updatedMarketplace);
		} catch (err) {
			const pe = newProgramError("mp_db_update", HttpStatus.AMBIGUOUS, "failed to update the marketplace in database", err, "handleMarketplaceUpdateEvent", { marketplace: updatedMarketplace })
			pe.log();
		}
	}
}