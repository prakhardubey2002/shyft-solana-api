import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { RavenModule, RavenInterceptor } from 'nest-raven';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NftInfoAccessor } from 'src/dal/nft-repo/nft-info.accessor';
import { NftInfo, NftInfoSchema } from 'src/dal/nft-repo/nft-info.schema';
import { RemoteDataFetcherService } from './remote-data-fetcher/data-fetcher.service';
import { NFtDbSyncService } from './db-sync/nft-db-sync.service';
import { ListingDbSyncService } from './db-sync/listing-db-sync.service';
import { Listing, ListingSchema } from 'src/dal/listing-repo/listing.schema';
import { ListingRepo } from 'src/dal/listing-repo/listing-repo';
import { MarketplaceDbSyncService } from './db-sync/marketplace-db-sync';
import { MarketplaceRepo } from 'src/dal/marketplace-repo/marketplace-repo';
import {
  Marketplace,
  MarketPlaceSchema,
} from 'src/dal/marketplace-repo/marketplace.schema';
import { S3UploaderService } from 'src/common/utils/s3-uploader';
import { WalletAccessor } from 'src/dal/wallet-repo/wallet.accessor';
import { Wallet, WalletSchema } from 'src/dal/wallet-repo/wallet.schema';
import { WalletDbSyncService } from './db-sync/wallet-db-sync.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NftInfo.name, schema: NftInfoSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Listing.name, schema: ListingSchema },
      { name: Marketplace.name, schema: MarketPlaceSchema },
    ]),
    HttpModule,
    EventEmitterModule.forRoot(),
    RavenModule,
  ],
  providers: [
    NftInfoAccessor,
    WalletAccessor,
    WalletDbSyncService,
    NFtDbSyncService,
    RemoteDataFetcherService,
    ListingDbSyncService,
    ListingRepo,
    MarketplaceDbSyncService,
    MarketplaceRepo,
    S3UploaderService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
  exports: [
    NftInfoAccessor,
    WalletAccessor,
    WalletDbSyncService,
    NFtDbSyncService,
    RemoteDataFetcherService,
    ListingDbSyncService,
  ],
})
export class DataCacheModule { }
