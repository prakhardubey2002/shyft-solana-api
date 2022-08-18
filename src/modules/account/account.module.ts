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

@Module({
  controllers: [
    AccountController,
    SendSolDetachController,
    SignTransactionController,
  ],
  imports: [
    RavenModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    DbModule,
  ],
  providers: [
    WalletService,
    RemoteDataFetcherService,
    SendSolDetachService,
    SignTransactionService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
})
export class AccountModule { }
