import { Body, Controller, Get, Post, Query, Req, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { BuyAttachedDto as BuyAttachedDto } from './dto/buy-listed.dto';
import { UnlistAttachedDto } from './dto/cancel-listing.dto';
import { ListAttachedDto } from './dto/create-list.dto';
import { CreateMarketPlaceAttachedDto } from './dto/create-mp.dto';
import { FindMarketplaceDto } from './dto/find-marketplace.dto';
import { GetListingDetailsDto } from './dto/get-listing-details.dto';
import { GetListingsDto } from './dto/get-listings.dto';
import { GetMarketplacesDto } from './dto/get-mp.dto';
import { GetPurchasesDto } from './dto/get-purchases.dto';
import { GetSellerListingsDto } from './dto/get-seller-listings.dto';
import { GetTreasuryBalanceDto } from './dto/treasury-balance.dto';
import { UpdateMarketplaceAttachedDto } from './dto/update-marketplace.dto';
import { WithdrawFeeAttachedDto } from './dto/withdraw-royalty.dto';
import { ListingService } from './listing-service';
import { MarketplaceService, UpdateMpSerivceDto } from './mp-service';
import { ActiveListingsOpenApi, ActiveSellersOpenApi, BuyListingAttachedOpenApi, CreateListingAttachedOpenApi, CreateMpAttachedOpenApi, FindMpOpenApi, ListDetailsOpenApi, MyMarketsOpenApi, OrderHistoryOpenApi, SellerListingsOpenApi, UnlistOpenAttachedApi, UpdateMpAttachedOpenApi, WithdrawAttachedOpenApi } from './open-api';

@ApiTags('MarketPlace')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('marketplace')
export class CreateMarketplaceController {
	constructor(private marketplaceService: MarketplaceService, private listingService: ListingService) { }

	@Post('create')
	@CreateMpAttachedOpenApi()
	@Version('0')
	async createMarketplace(@Body() createMarketPlaceDto: CreateMarketPlaceAttachedDto, @Req() request: any): Promise<any> {
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

	@Post('withdraw_fee')
	@WithdrawAttachedOpenApi()
	@Version('0')
	async withdrawFees(@Body() withdrawFeeDto: WithdrawFeeAttachedDto, @Req() request: any): Promise<any> {
		console.log("withdraw fee request received");
		const result = await this.marketplaceService.withdrawFee(withdrawFeeDto);
		return {
			success: true,
			message: 'Fee withdrawn successfully',
			result: result,
		}
	}

	@Post('update')
	@UpdateMpAttachedOpenApi()
	@Version('0')
	async update(@Body() updateMpDto: UpdateMarketplaceAttachedDto, @Req() request: any): Promise<any> {
		console.log("update marketplace request received");
		const serviceDto: UpdateMpSerivceDto = {
			apiKeyId: request.id,
			update: updateMpDto
		}
		const result = await this.marketplaceService.updateAuctionHouse(serviceDto);
		return {
			success: true,
			message: 'Marketplace updated successfully',
			result: result,
		}
	}

	@Get('treasury_balance')
	@Version('1')
	async getTreasuryBalance(@Query() getTreasuryBalance: GetTreasuryBalanceDto, @Req() request: any): Promise<any> {
		console.log('get treasury balance request received');
		const result = await this.marketplaceService.getTreasuryBalance(getTreasuryBalance);
		return {
			success: true,
			message: "treasury balance fetched successfully",
			result: result
		}

	}

	@Post('list')
	@CreateListingAttachedOpenApi()
	@Version('0')
	async list(@Body() createListingDto: ListAttachedDto, @Req() request: any): Promise<any> {
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
	@BuyListingAttachedOpenApi()
	@Version('0')
	async buy(@Body() buyListedDto: BuyAttachedDto, @Req() request: any): Promise<any> {
		console.log("buy listed item request received");
		const result = await this.listingService.buy(buyListedDto);
		return {
			success: true,
			message: 'Purchased successfully',
			result: result,
		}
	}

	@Post('unlist')
	@UnlistOpenAttachedApi()
	@Version('0')
	async unlist(@Body() unlistDto: UnlistAttachedDto, @Req() request: any): Promise<any> {
		console.log("unlist item request received");
		const result = await this.listingService.cancelListing(unlistDto);
		return {
			success: true,
			message: 'NFT unlisted successfully',
			result: result,
		}
	}

	@Get('my_markets')
	@MyMarketsOpenApi()
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


	@Get('find')
	@FindMpOpenApi()
	@Version('1')
	async findMarketplace(@Query() findMarketplaceDto: FindMarketplaceDto, @Req() request: any) {
		console.log("find marketplace request received");
		const result = await this.marketplaceService.findMarketplace(findMarketplaceDto)
		return {
			success: true,
			message: "Marketplace found successfully",
			result: result
		}
	}

	@Get('list_details')
	@ListDetailsOpenApi()
	@Version('1')
	async findListing(@Query() getListingDetailsDto: GetListingDetailsDto, @Req() request: any): Promise<any> {
		console.log("getListingDetails request received");
		const result = await this.listingService.findListing(getListingDetailsDto);
		return {
			success: true,
			message: 'Listing details fetched successfully',
			result: result,
		}
	}

	@Get('active_listings')
	@ActiveListingsOpenApi()
	@Version('1')
	async getActiveListingInMarketPlace(@Query() getListingDto: GetListingsDto, @Req() request: any): Promise<any> {
		console.log("get activeListings request received");
		const result = await this.listingService.getActiveListings(getListingDto);
		return {
			success: true,
			message: 'Active listing fetched successfully',
			result: result,
		}
	}

	@Get('active_sellers')
	@ActiveSellersOpenApi()
	@Version('1')
	async getActiveSellersInMarketPlace(@Query() getListingDto: GetListingsDto, @Req() request: any): Promise<any> {
		console.log("get active sellers in market request received");
		const result = await this.listingService.getActiveSellers(getListingDto);
		return {
			success: true,
			message: 'Active sellers fetched successfully',
			result: result,
		}
	}

	@Get('seller_listings')
	@SellerListingsOpenApi()
	@Version('1')
	async getSellerListingsInMarketPlace(@Query() getListingDto: GetSellerListingsDto, @Req() request: any): Promise<any> {
		console.log("get active listings of a seller in market request received");
		const result = await this.listingService.getSellerListings(getListingDto);
		return {
			success: true,
			message: 'Seller listings fetched successfully',
			result: result,
		}
	}

	@Get('buy_history')
	@OrderHistoryOpenApi()
	@Version('1')
	async getPurchases(@Query() getPurchasesDto: GetPurchasesDto, @Req() request: any): Promise<any> {
		console.log("get active listings of a seller in market request received");
		const result = await this.listingService.getPurchases(getPurchasesDto);
		return {
			success: true,
			message: 'Order history fetched successfully',
			result: result,
		}
	}
}
