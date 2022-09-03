import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { RavenModule, RavenInterceptor } from 'nest-raven';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModule } from '../helper/db.module';
import { User, UserSchema } from 'src/dal/user.schema';
import { AccountController } from './account.controller';
import { WalletService } from './account.service';
import { RemoteDataFetcherService } from '../helper/remote-data-fetcher/data-fetcher.service';
import { SendSolDetachController } from './components/send-sol-detach/send-sol-detach.controller';
import { SignTransactionController } from './components/sign-transaction/sign-transaction.controller';
import { SendSolDetachService } from './components/send-sol-detach/send-sol-detach.service';
import { SignTransactionService } from './components/sign-transaction/sign-transaction.service';
import { SemiWalletAccessor } from 'src/dal/semi-wallet-repo/semi-wallet.accessor';
import { SemiWalletSchema, SemiCustodialWallet } from 'src/dal/semi-wallet-repo/semi-wallet.schema';

@Module({
  controllers: [
    AccountController,
    SendSolDetachController,
    SignTransactionController,
  ],
  imports: [
    RavenModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: SemiCustodialWallet.name, schema: SemiWalletSchema },
    ]),
    DbModule,
  ],
  exports: [SemiWalletAccessor, WalletService],
  providers: [
    WalletService,
    RemoteDataFetcherService,
    SendSolDetachService,
    SignTransactionService,
    SemiWalletAccessor,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
})
export class AccountModule { }
