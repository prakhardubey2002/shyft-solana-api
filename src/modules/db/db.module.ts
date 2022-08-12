import { APP_INTERCEPTOR } from '@nestjs/core'; 
import { Module } from '@nestjs/common';
import { RavenModule, RavenInterceptor } from 'nest-raven';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NftInfoAccessor } from 'src/dal/nft-repo/nft-info.accessor';
import { NftInfo, NftInfoSchema } from 'src/dal/nft-repo/nft-info.schema';
import { RemoteDataFetcherService } from './remote-data-fetcher/data-fetcher.service';
import { DbSyncService } from './db-sync/db-sync.service';

@Module({
  imports: [
    RavenModule,
    MongooseModule.forFeature([{ name: NftInfo.name, schema: NftInfoSchema }]),
    HttpModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [
    NftInfoAccessor,
    DbSyncService,
    RemoteDataFetcherService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
  exports: [NftInfoAccessor, DbSyncService, RemoteDataFetcherService],
})
export class DbModule {}
