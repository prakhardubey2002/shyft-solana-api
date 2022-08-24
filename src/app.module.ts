import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RavenModule, RavenInterceptor } from 'nest-raven';
import 'dotenv/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './modules/account/account.module';
import { NftModule } from './modules/nft/nft.module';
import { configuration } from './common/configs/config';
import { AuthModule } from './modules/auth/auth.module';
import { User, UserSchema } from './dal/user.schema';
import { Emailer } from './common/utils/emailer';
import { TokenModule } from './modules/token/token.module';
import { ApiMonitorModule } from './modules/api-monitor/api-monitor.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    RavenModule,
    MongooseModule.forRoot(configuration().mongoURI, {
      useNewUrlParser: true,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AccountModule,
    NftModule,
    AuthModule,
    TokenModule,
    ApiMonitorModule,
    MarketplaceModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Emailer,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
})
export class AppModule { }
