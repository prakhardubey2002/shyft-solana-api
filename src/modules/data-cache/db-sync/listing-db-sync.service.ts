import {
  findListingReceiptPda,
  findPurchaseReceiptPda,
  Metaplex,
  toDateTime,
  toListingReceiptAccount,
  toPurchaseReceiptAccount,
} from '@metaplex-foundation/js';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { configuration } from 'src/common/configs/config';
import { Timer } from 'src/common/utils/timer';
import { Utility } from 'src/common/utils/utils';
import { newProgramErrorFrom } from 'src/core/program-error';
import { ListingRepo } from 'src/dal/listing-repo/listing-repo';
import { Listing } from 'src/dal/listing-repo/listing.schema';
import { NftInfoAccessor } from 'src/dal/nft-repo/nft-info.accessor';
import {
  ListingCancelledEvent,
  ListingCreatedEvent,
  ListingInitiationEvent,
  ListingSoldEvent,
  NftSyncEvent,
  SaleInitiationEvent,
  UnlistInitiationEvent,
} from './db.events';

const LISTING_TIMER_INTERVAL = parseInt(configuration().mpTimerInterval) * 1000;
const LISTING_TIMER_EXPIRY = parseInt(configuration().mpTimerExpiration) * 1000;

@Injectable()
export class ListingDbSyncService {
  constructor(
    private eventEmitter: EventEmitter2,
    private listingRepo: ListingRepo,
    private nftInfoAccessor: NftInfoAccessor,
  ) {}
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
        event.currency_symbol,
      );
      await this.listingRepo.insert(listing);
      this.triggerNftSync(event.network, event.nftAddress);
    } catch (err) {
      newProgramErrorFrom(err, 'listing_db_insert').log();
    }
  }

  @OnEvent('listing.sold', { async: true })
  async handleListingSoldEvent(event: ListingSoldEvent): Promise<any> {
    try {
      await this.listingRepo.markSold(
        event.network,
        event.listState,
        event.buyerAddress,
        event.purchasedAt,
        event.purchaseReceipt,
      );
      await this.nftInfoAccessor.updateNftOwner(
        event.network,
        event.nftAddress,
        event.buyerAddress,
      );
    } catch (err) {
      newProgramErrorFrom(err, 'listing_db_mark_sold').log();
    }
  }

  @OnEvent('listing.cancelled', { async: true })
  async handleListingCancelledEvent(
    event: ListingCancelledEvent,
  ): Promise<any> {
    try {
      const cancelTime = new Date(event.cancelledAt);
      await this.listingRepo.updateCancelledAt(
        event.network,
        event.listState,
        cancelTime,
      );
    } catch (err) {
      newProgramErrorFrom(err, 'listing_db_mark_cancelled').log();
    }
  }

  @OnEvent('listing.creation.initiated', { async: true })
  async handleListingCreationInitiationEvent(
    event: ListingInitiationEvent,
  ): Promise<any> {
    const syncListing = this.syncListingCreation.bind(this);
    Timer.setTimer(
      syncListing,
      event,
      LISTING_TIMER_EXPIRY,
      LISTING_TIMER_INTERVAL,
    );
  }

  @OnEvent('listing.unlist.initiated', { async: true })
  async handleUnlistInitiationEvent(
    event: UnlistInitiationEvent,
  ): Promise<any> {
    const syncCancellation = this.syncListingCancellation.bind(this);
    Timer.setTimer(
      syncCancellation,
      event,
      LISTING_TIMER_EXPIRY,
      LISTING_TIMER_INTERVAL,
    );
  }

  @OnEvent('listing.sale.initiated', { async: true })
  async handleSaleInitiationEvent(event: SaleInitiationEvent): Promise<any> {
    const saleInitiation = this.syncSaleInitiation.bind(this);
    Timer.setTimer(
      saleInitiation,
      event,
      LISTING_TIMER_EXPIRY,
      LISTING_TIMER_INTERVAL,
    );
  }

  private async syncListingCreation(event: ListingInitiationEvent, date: Date) {
    try {
      const connection = Utility.connectRpc(event.network);
      const metaplex = Metaplex.make(connection, { cluster: event.network });
      const auctionsClient = metaplex.auctions();
      const auctionHouse = await auctionsClient
        .findAuctionHouseByAddress(event.auctionHouseAddress)
        .run();
      const listing = await auctionsClient
        .for(auctionHouse)
        .findListingByAddress(event.listState)
        .run();

      if (listing.canceledAt != null) {
        return;
      }

      const price =
        listing.price.basisPoints.toNumber() /
        Math.pow(10, listing.price.currency.decimals);
      const currencySymbol = await Utility.token.getTokenSymbol(
        event.network,
        auctionHouse.treasuryMint.address.toBase58(),
      );
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
      const nftAddress = listing.asset.address.toBase58();
      await this.triggerNftSync(event.network, nftAddress);
      Timer.clearTimer(date);
    } catch (error) {
      const err = newProgramErrorFrom(error);
      if (!err.name.includes('account_not_found')) {
        err.log();
      } else {
        console.log(
          'listing not created, listState: ',
          event.listState.toBase58(),
        );
      }
    }
  }

  private async syncListingCancellation(
    event: UnlistInitiationEvent,
    date: Date,
  ) {
    const receiptAddress = findListingReceiptPda(event.listState);
    const connection = Utility.connectRpc(event.network);
    const metaplex = Metaplex.make(connection);
    const account = toListingReceiptAccount(
      await metaplex.rpc().getAccount(receiptAddress),
    );
    let cancelledAt;
    console.log('checking listing cancellation');
    if (account.data.canceledAt != null) {
      cancelledAt = new Date(
        toDateTime(account.data.canceledAt).toNumber() * 1000,
      );
      this.listingRepo.updateCancelledAt(
        event.network,
        event.listState.toBase58(),
        cancelledAt,
      );
      console.log('listing cancelled');
      Timer.clearTimer(date);
    }
  }

  private async syncSaleInitiation(event: SaleInitiationEvent, date: Date) {
    try {
      const connection = Utility.connectRpc(event.network);
      const metaplex = Metaplex.make(connection);
      const receiptAddress = findPurchaseReceiptPda(
        event.listState,
        event.bidState,
      );
      const account = toPurchaseReceiptAccount(
        await metaplex.rpc().getAccount(receiptAddress),
      );

      if (account != null) {
        const createdAt = toDateTime(account.data.createdAt);
        const buyer = account.data.buyer.toBase58();
        const purchaseReceipt = account.publicKey.toBase58();
        this.listingRepo.markSold(
          event.network,
          event.listState.toBase58(),
          buyer,
          createdAt,
          purchaseReceipt,
        );

        await this.nftInfoAccessor.updateNftOwner(
          event.network,
          event.nftAddress,
          buyer,
        );
        console.log('listing purchased');
        Timer.clearTimer(date);
      }
    } catch (error) {
      const err = newProgramErrorFrom(error);
      if (!err.name.includes('account_not_found')) {
        err.log();
      } else {
        console.log(
          'listing not bought, listState: ',
          event.listState.toBase58(),
        );
      }
    }
  }

  async triggerNftSync(
    network: WalletAdapterNetwork,
    nftAddress: string,
  ): Promise<any> {
    const nftReadEvent = new NftSyncEvent(nftAddress, network);
    this.eventEmitter.emit('nft.read', nftReadEvent);
  }
}
