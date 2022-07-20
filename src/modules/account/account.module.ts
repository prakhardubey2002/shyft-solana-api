import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModule } from '../db/db.module';
import { User, UserSchema } from 'src/dal/user.schema';
import { AccountController } from './account.controller';
import { WalletService } from './account.service';
import { RemoteDataFetcherService } from '../db/remote-data-fetcher/data-fetcher.service';

@Module({
  controllers: [AccountController],
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), DbModule],
  providers: [WalletService, RemoteDataFetcherService],
})
export class AccountModule {}
