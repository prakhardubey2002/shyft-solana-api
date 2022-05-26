import { Module } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { CreateNftController } from './components/create-nft/create-nft.controller';
import { CreateNftService } from './components/create-nft/create-nft.service';

@Module({
  controllers: [CreateNftController],
  providers: [CreateNftService, AccountService],
})
export class NftModule {}
