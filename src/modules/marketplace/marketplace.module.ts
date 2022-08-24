import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ListingRepo } from "src/dal/listing-repo/listing-repo";
import { Listing, ListingSchema } from "src/dal/listing-repo/listing.schema";
import { MarketplaceRepo } from "src/dal/marketplace-repo/marketplace-repo";
import { MarketPlace, MarketPlaceSchema } from "src/dal/marketplace-repo/marketplace.schema";
import { ListingService } from "./listing-service";
import { CreateMarketplaceController } from "./mp-controller";
import { MarketplaceService } from "./mp-service";

@Module({
	imports: [HttpModule, MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }, { name: MarketPlace.name, schema: MarketPlaceSchema }])],
	controllers: [CreateMarketplaceController],
	providers: [MarketplaceService, ListingService, ListingRepo, MarketplaceRepo],
})
export class MarketplaceModule { }