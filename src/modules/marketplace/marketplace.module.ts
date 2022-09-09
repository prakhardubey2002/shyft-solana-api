import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ListingRepo } from "src/dal/listing-repo/listing-repo";
import { Listing, ListingSchema } from "src/dal/listing-repo/listing.schema";
import { MarketplaceRepo } from "src/dal/marketplace-repo/marketplace-repo";
import { Marketplace, MarketPlaceSchema } from "src/dal/marketplace-repo/marketplace.schema";
import { NftInfoAccessor } from "src/dal/nft-repo/nft-info.accessor";
import { NftInfo, NftInfoSchema } from "src/dal/nft-repo/nft-info.schema";
import { AccountModule } from "../account/account.module";
import { RemoteDataFetcherService } from "../helper/remote-data-fetcher/data-fetcher.service";
import { ListingDetachedService } from "./listing-detached-service";
import { ListingService } from "./listing-service";
import { CreateMarketplaceController } from "./mp-controller";
import { MarketplaceDetachController } from "./mp-detached-controller";
import { MarketplaceDetachedService } from "./mp-detached-service";
import { MarketplaceService } from "./mp-service";

@Module({
	imports: [
		AccountModule,
		HttpModule,
		MongooseModule.forFeature([
			{ name: Listing.name, schema: ListingSchema },
			{ name: Marketplace.name, schema: MarketPlaceSchema },
			{ name: NftInfo.name, schema: NftInfoSchema },
		]),
	],
	controllers: [CreateMarketplaceController, MarketplaceDetachController],
	providers: [
		MarketplaceService,
		ListingService,
		ListingRepo,
		MarketplaceRepo,
		MarketplaceDetachedService,
		ListingDetachedService,
		NftInfoAccessor,
		RemoteDataFetcherService,
	],
	exports: [MarketplaceService],
})
export class MarketplaceModule { }