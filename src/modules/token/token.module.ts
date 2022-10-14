import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { RavenModule, RavenInterceptor } from 'nest-raven';
import { StorageMetadataService } from '../nft/components/storage-metadata/storage-metadata.service';
import { CreateTokenController } from './components/create-token/create-token.controller';
import { CreateTokenService } from './components/create-token/create-token.service';
import { BurnTokenController } from './components/burn-token/burn-token.controller';
import { BurnTokenService } from './components/burn-token/burn-token.service';
import { MintTokenController } from './components/mint-token/mint-token.controller';
import { MintTokenService } from './components/mint-token/mint-token.service';
import { GetTokenController } from './components/get-token/get-token.controller';
import { GetTokenService } from './components/get-token/get-token.service';
import { TransferTokenController } from './components/transfer-token/transfer-token.controller';
import { TransferTokenService } from './components/transfer-token/transfer-token.service';

@Module({
  imports: [RavenModule],
  controllers: [
    CreateTokenController,
    BurnTokenController,
    MintTokenController,
    GetTokenController,
    TransferTokenController,
  ],
  providers: [
    CreateTokenService,
    BurnTokenService,
    MintTokenService,
    StorageMetadataService,
    GetTokenService,
    TransferTokenService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
  exports: [GetTokenService],
})
export class TokenModule {}
