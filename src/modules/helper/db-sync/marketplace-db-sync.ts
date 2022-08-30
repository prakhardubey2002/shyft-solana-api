import { toPublicKey } from "@metaplex-foundation/js";
import { HttpStatus, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Utility } from "src/common/utils/utils";
import { newProgramError, newProgramErrorFrom } from "src/core/program-error";
import { MarketplaceRepo } from "src/dal/marketplace-repo/marketplace-repo";
import { Marketplace } from "src/dal/marketplace-repo/marketplace.schema";
import { MarketplaceCreationEvent, MarketplaceInitiationEvent, MarketplaceUpdateInitiationEvent, UpdateMarketplaceEvent } from "./db.events";

@Injectable()
export class MarketplaceDbSyncService {
	constructor(private marketplaceRepo: MarketplaceRepo) { }
	@OnEvent('marketplace.created', { async: true })
	async handleMarketplaceCreationEvent(event: MarketplaceCreationEvent): Promise<any> {
		const marketplace = new Marketplace(
			event.apiKeyId,
			event.network,
			event.address,
			event.currencyAddress,
			event.feePayer,
			event.feeReceipient,
			event.treasuryAddress,
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
		const updatedMarketplace = new Marketplace();
		updatedMarketplace.address = event.address;
		updatedMarketplace.currency_address = event.currencyAddress;
		updatedMarketplace.currency_symbol = event.currencySymbol;
		updatedMarketplace.fee_payer = event.feePayer;
		updatedMarketplace.fee_receipient = event.feeRecipient;
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

	@OnEvent('marketplace.creation.initiated', { async: true })
	async handleMarketplaceCreationInitiatedEvent(event: MarketplaceInitiationEvent): Promise<any> {
		const serObj = this;
		setTimeout(this.validateMarketplaceCreation, 20000, serObj, event);
	}

	private async validateMarketplaceCreation(obj: MarketplaceDbSyncService, event: MarketplaceInitiationEvent) {
		try {
			const marketplace = await createDbMpObject(event);
			await obj.marketplaceRepo.insert(marketplace);
		} catch (error) {
			const err = newProgramErrorFrom(error);
			if (!err.name.includes("account_not_found")) {
				err.log();
			}
		}
	}

	@OnEvent('marketplace.update.initiated', { async: true })
	async handleMarketplaceUpdateInitiatedEvent(event: MarketplaceUpdateInitiationEvent): Promise<any> {
		const serObj = this;
		setTimeout(this.validateMarketplaceUpdation, 20000, serObj, event);
	}

	private async validateMarketplaceUpdation(obj: MarketplaceDbSyncService, event: MarketplaceUpdateInitiationEvent) {
		try {
			const marketplace = await createDbMpObject(event);
			await obj.marketplaceRepo.updateMarketplace(marketplace);
		} catch (error) {
			const err = newProgramErrorFrom(error);
			if (!err.name.includes("account_not_found")) {
				err.log();
			}
		}
	}
}

async function createDbMpObject(event: MarketplaceInitiationEvent): Promise<Marketplace> {
	const auctionHouse = await Utility.auctionHouse.findAuctionHouse(
		event.network,
		toPublicKey(event.address)
	);
	const currencySymbol = await Utility.token.getTokenSymbol(event.network, auctionHouse.treasuryMint.address.toBase58());
	const marketplace = new Marketplace(
		event.apiKeyId,
		event.network,
		auctionHouse.address.toBase58(),
		auctionHouse.treasuryMint.address.toBase58(),
		auctionHouse.feeAccountAddress.toBase58(),
		auctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
		auctionHouse.treasuryAccountAddress.toBase58(),
		auctionHouse.sellerFeeBasisPoints / 100,
		auctionHouse.creatorAddress.toBase58(),
		currencySymbol,
		auctionHouse.authorityAddress.toBase58(),
		auctionHouse.canChangeSalePrice,
		auctionHouse.requiresSignOff
	);
	return marketplace;
}