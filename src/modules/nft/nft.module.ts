import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { RavenModule, RavenInterceptor } from 'nest-raven';
import { WalletService } from '../account/account.service';
import { CreateNftController } from './components/create-nft/create-nft.controller';
import { CreateNftService } from './components/create-nft/create-nft.service';
import { ReadNftController } from './components/read-nft/read-nft.controller';
import { ReadNftService } from './components/read-nft/read-nft.service';
import { BurnNftController } from './components/burn-nft/burn-nft.controller';
import { BurnNftService } from './components/burn-nft/burn-nft.service';
import { UpdateNftController } from './components/update-nft/update-nft.controller';
import { UpdateNftService } from './components/update-nft/update-nft.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/dal/user-repo/user.schema';
import { StorageMetadataController } from './components/storage-metadata/storage-metadata.controller';
import { StorageMetadataService } from './components/storage-metadata/storage-metadata.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DataCacheModule } from '../data-cache/data-cache.module';
import { SearchNftcontroller } from './components/search-nft/search-nft.controller';
import { SearchNftService } from './components/search-nft/search-nft.service';
import { TransferNftService } from './components/transfer-nft/transfer-nft.service';
import { TransferNftController } from './components/transfer-nft/transfer-nft.controller';
import { MintNftController } from './components/mint-nft/mint-nft.controller';
import { MintNftService } from './components/mint-nft/mint-nft.service';
import { CreateNftDetachController } from './components/create-nft-detach/create-nft-detach.controller';
import { CreateNftDetachService } from './components/create-nft-detach/create-nft-detach.service';
import { BurnNftDetachController } from './components/burn-nft-detach/burn-nft-detach.controller';
import { BurnNftDetachService } from './components/burn-nft-detach/burn-nft-detach.service';
import { AccountModule } from '../account/account.module';
import { TokenModule } from '../token/token.module';
import { CandyMachineController } from './components/candy-machine/candy-machine.controller';
import { CandyMachineService } from './components/candy-machine/candy-machine.service';

@Module({
  controllers: [
    CreateNftController,
    CreateNftDetachController,
    ReadNftController,
    BurnNftController,
    BurnNftDetachController,
    UpdateNftController,
    StorageMetadataController,
    SearchNftcontroller,
    TransferNftController,
    MintNftController,
    CandyMachineController,
  ],
  imports: [
    RavenModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EventEmitterModule.forRoot(),
    DataCacheModule,
    AccountModule,
    TokenModule,
  ],
  providers: [
    CreateNftService,
    CreateNftDetachService,
    WalletService,
    ReadNftService,
    BurnNftService,
    BurnNftDetachService,
    UpdateNftService,
    StorageMetadataService,
    SearchNftService,
    TransferNftService,
    MintNftService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
    CandyMachineService,
  ],
  exports: [ReadNftService],
})
export class NftModule {}
