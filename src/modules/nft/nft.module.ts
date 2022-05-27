import { Module } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { CreateNftController } from './components/create-nft/create-nft.controller';
import { CreateNftService } from './components/create-nft/create-nft.service';
import { ReadNftController } from './components/read-nft/read-nft.controller';
import { ReadNftService } from './components/read-nft/read-nft.service';
import { BurnNftController } from './components/burn-nft/burn-nft.controller';
import { BurnNftService } from './components/burn-nft/burn-nft.service';

@Module({
  controllers: [CreateNftController, ReadNftController, BurnNftController],
  providers: [CreateNftService, AccountService, ReadNftService, BurnNftService],
})
export class NftModule {}
