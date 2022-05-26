import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './modules/account/account.module';
import { NftModule } from './modules/nft/nft.module';

@Module({
  imports: [AccountModule, NftModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
