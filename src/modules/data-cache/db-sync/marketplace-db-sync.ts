import { toPublicKey } from '@metaplex-foundation/js';
import { HttpStatus, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Utility } from 'src/common/utils/utils';
import { newProgramError, newProgramErrorFrom } from 'src/core/program-error';
import { MarketplaceRepo } from 'src/dal/marketplace-repo/marketplace-repo';
import { Marketplace } from 'src/dal/marketplace-repo/marketplace.schema';
import {
  MarketplaceCreationEvent,
  MarketplaceInitiationEvent,
  MarketplaceUpdateInitiationEvent,
  UpdateMarketplaceEvent,
} from './db.events';
import { configuration } from 'src/common/configs/config';
import { Timer } from 'src/common/utils/timer';

const MP_TIMER_INTERVAL = parseInt(configuration().mpTimerInterval) * 1000;
const MP_TIMER_EXPIRY = parseInt(configuration().mpTimerExpiration) * 1000;

@Injectable()
export class MarketplaceDbSyncService {
  constructor(private marketplaceRepo: MarketplaceRepo) {}

  @OnEvent('marketplace.created', { async: true })
  async handleMarketplaceCreationEvent(
    event: MarketplaceCreationEvent,
  ): Promise<any> {
    const marketplace = new Marketplace(
      event.apiKeyId,
      event.network,
      event.address,
      event.currencyAddress,
      event.feePayer,
      event.feeRecipient,
      event.feeRecipientAccount,
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
      const pe = newProgramError(
        'mp_db_insert',
        HttpStatus.AMBIGUOUS,
        'failed to insert the marketplace in database',
        err,
        'handleMarketplaceCreationEvent',
        { marketplace: marketplace },
      );
      pe.log();
    }
  }

  @OnEvent('marketplace.updated', { async: true })
  async handleMarketplaceUpdateEvent(
    event: UpdateMarketplaceEvent,
  ): Promise<any> {
    const updatedMarketplace = new Marketplace();
    updatedMarketplace.address = event.address;
    updatedMarketplace.currency_address = event.currencyAddress;
    updatedMarketplace.currency_symbol = event.currencySymbol;
    updatedMarketplace.fee_payer = event.feePayer;
    updatedMarketplace.treasury_withdrawal_destination_owner =
      event.feeRecipient;
    updatedMarketplace.transaction_fee = event.transactionFee;
    updatedMarketplace.can_change_sale_price = event.canChangeSalePrice;
    updatedMarketplace.requires_sign_off = event.requiresSignOff;
    updatedMarketplace.authority = event.authority;
    updatedMarketplace.api_key_id = event.apiKeyId;
    updatedMarketplace.creator = event.creator;
    try {
      await this.marketplaceRepo.updateMarketplace(updatedMarketplace);
    } catch (err) {
      const pe = newProgramError(
        'mp_db_update',
        HttpStatus.AMBIGUOUS,
        'failed to update the marketplace in database',
        err,
        'handleMarketplaceUpdateEvent',
        { marketplace: updatedMarketplace },
      );
      pe.log();
    }
  }

  @OnEvent('marketplace.creation.initiated', { async: true })
  async handleMarketplaceCreationInitiatedEvent(
    event: MarketplaceInitiationEvent,
  ): Promise<any> {
    const handleMpCreation = this.validateMarketplaceCreation.bind(this);
    Timer.setTimer(handleMpCreation, event, MP_TIMER_INTERVAL, MP_TIMER_EXPIRY);
  }

  private async validateMarketplaceCreation(
    event: MarketplaceInitiationEvent,
    date: Date,
  ) {
    try {
      const marketplace = await createDbMpObject(event);
      await this.marketplaceRepo.insert(marketplace);
      Timer.clearTimer(date);
    } catch (error) {
      const err = newProgramErrorFrom(error);
      if (!err.name.includes('account_not_found')) {
        err.log();
      }
    }
  }

  @OnEvent('marketplace.update.initiated', { async: true })
  async handleMarketplaceUpdateInitiatedEvent(
    event: MarketplaceUpdateInitiationEvent,
  ): Promise<any> {
    const handleMpUpdation = this.validateMarketplaceUpdation.bind(this);
    Timer.setTimer(handleMpUpdation, event, MP_TIMER_INTERVAL, MP_TIMER_EXPIRY);
  }

  private async validateMarketplaceUpdation(
    event: MarketplaceUpdateInitiationEvent,
    date: Date,
  ) {
    try {
      const onChainMarketplace = await createDbMpObject(event);
      const dbMp = await this.marketplaceRepo.getMarketplacesByAddress(
        event.network,
        event.address,
      );
      if (onChainMarketplace.isEqual(dbMp)) {
        return;
      }
      await this.marketplaceRepo.updateMarketplace(onChainMarketplace);
      Timer.clearTimer(date);
    } catch (error) {
      const err = newProgramErrorFrom(error);
      if (!err.name.includes('account_not_found')) {
        err.log();
      }
    }
  }
}

async function createDbMpObject(
  event: MarketplaceInitiationEvent,
): Promise<Marketplace> {
  const auctionHouse = await Utility.auctionHouse.findAuctionHouse(
    event.network,
    toPublicKey(event.address),
  );
  const currencySymbol = await Utility.token.getTokenSymbol(
    event.network,
    auctionHouse.treasuryMint.address.toBase58(),
  );
  const marketplace = new Marketplace(
    event.apiKeyId,
    event.network,
    auctionHouse.address.toBase58(),
    auctionHouse.treasuryMint.address.toBase58(),
    auctionHouse.feeWithdrawalDestinationAddress.toBase58(),
    event.feeRecipient,
    auctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
    auctionHouse.treasuryAccountAddress.toBase58(),
    auctionHouse.sellerFeeBasisPoints / 100,
    auctionHouse.creatorAddress.toBase58(),
    currencySymbol,
    auctionHouse.authorityAddress.toBase58(),
    auctionHouse.canChangeSalePrice,
    auctionHouse.requiresSignOff,
  );
  return marketplace;
}
