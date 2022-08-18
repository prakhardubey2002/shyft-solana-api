import { Body, Controller, Get, Post, Query, Req, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { BuyDto as BuyDto } from './dto/buy-listed.dto';
import { CancelListingDto } from './dto/cancel-listing.dto';
import { CreateListingDto } from './dto/create-list.dto';
import { CreateMarketPlaceDto } from './dto/create-mp.dto';
import { GetListingDetailsDto } from './dto/get-listing-details.dto';
import { GetListingsDto } from './dto/get-listings.dto';
import { GetMarketplacesDto } from './dto/get-mp.dto';
import { GetPurchasesDto } from './dto/get-purchases.dto';
import { GetSellerListingsDto } from './dto/get-seller-listings.dto';
import { ListingService } from './listing-service';
import { MarketplaceService } from './mp-service';

@ApiTags('MarketPlace')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('marketplace')
export class CreateMarketplaceController {
	constructor(private marketplaceService: MarketplaceService, private listingService: ListingService) { }

	@Post('create')
	@Version('1')
	async createMarketplace(@Body() createMarketPlaceDto: CreateMarketPlaceDto, @Req() request: any): Promise<any> {
		console.log('market place request received.');

		const result = await this.marketplaceService.createMarketPlace({
			createMarketplaceParams: createMarketPlaceDto,
			apiKeyId: request.id
		});

		return {
			success: true,
			message: 'Marketplace created successfully',
			result: result,
		};
	}

	@Get('fetch')
	@Version('1')
	async getMarketplace(@Query() getMpDto: GetMarketplacesDto, @Req() request: any): Promise<any> {
		console.log('market places fetch request received.');
		const result = await this.marketplaceService.getMarketplaces({
			network: getMpDto.network,
			apiKeyId: request.id
		});

		return {
			success: true,
			message: 'Marketplaces fetched successfully',
			result: result,
		};
	}

	@Post('list')
	@Version('1')
	async list(@Body() createListingDto: CreateListingDto, @Req() request: any): Promise<any> {
		console.log('listing creation request received');

		const result = await this.listingService.createListing({
			apiKeyId: request.id,
			createListingParams: createListingDto
		});
		return {
			success: true,
			message: 'Listing created successfully',
			result: result,
		}
	}

	@Post('buy')
	@Version('1')
	async buy(@Body() buyListedDto: BuyDto, @Req() request: any): Promise<any> {
		console.log("buy listed item request received");
		const result = await this.listingService.buy(buyListedDto);
		return {
			success: true,
			message: 'purshased successfully',
			result: result,
		}
	}

	@Post('unlist')
	@Version('1')
	async unlist(@Body() unlistDto: CancelListingDto, @Req() request: any): Promise<any> {
		console.log("unlist item request received");
		const result = await this.listingService.cancelListing(unlistDto);
		return {
			success: true,
			message: 'item unlisted successfully',
			result: result,
		}
	}

	@Get('list_details')
	@Version('1')
	async getListingDetails(@Query() getListingDetailsDto: GetListingDetailsDto, @Req() request: any): Promise<any> {
		console.log("getListingDetails request received");
		const result = await this.listingService.getListDetails(getListingDetailsDto);
		return {
			success: true,
			message: 'listing details fetched successfully',
			result: result,
		}
	}

	@Get('active_listings')
	@Version('1')
	async getActiveListingInMarketPlace(@Query() getListingDto: GetListingsDto, @Req() request: any): Promise<any> {
		console.log("get activeListings request received");
		const result = await this.listingService.getActiveListings(getListingDto);
		return {
			success: true,
			message: 'active listing fetched successfully',
			result: result,
		}
	}

	@Get('active_sellers')
	@Version('1')
	async getActiveSellersInMarketPlace(@Query() getListingDto: GetListingsDto, @Req() request: any): Promise<any> {
		console.log("get active sellers in market request received");
		const result = await this.listingService.getActiveSellers(getListingDto);
		return {
			success: true,
			message: 'active listing fetched successfully',
			result: result,
		}
	}

	@Get('seller_listings')
	@Version('1')
	async getSellerListingsInMarketPlace(@Query() getListingDto: GetSellerListingsDto, @Req() request: any): Promise<any> {
		console.log("get active listings of a seller in market request received");
		const result = await this.listingService.getSellerListings(getListingDto);
		return {
			success: true,
			message: 'active listing fetched successfully',
			result: result,
		}
	}

	@Get('buy_history')
	@Version('1')
	async getPurchases(@Query() getPurchasesDto: GetPurchasesDto, @Req() request: any): Promise<any> {
		console.log("get active listings of a seller in market request received");
		const result = await this.listingService.getPurchases(getPurchasesDto);
		return {
			success: true,
			message: 'order history fetched successfully',
			result: result,
		}
	}
}
