import { Body, Controller, Post, Req, Version } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { BuyDto } from './dto/buy-listed.dto';
import { UnlistDto } from './dto/cancel-listing.dto';
import { ListDto } from './dto/create-list.dto';
import { CreateMarketPlaceDto } from './dto/create-mp.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';
import { WithdrawFeeDto } from './dto/withdraw-royalty.dto';
import { ListingDetachedService } from './listing-detached-service';
import { MarketplaceDetachedService } from './mp-detached-service';
import {
  BuyListingOpenApi,
  CreateListingOpenApi,
  CreateMpOpenApi,
  UnlistOpenApi,
  UpdateMpOpenApi,
  WithdrawOpenApi,
} from './open-api';

@ApiTags('MarketPlace')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('marketplace')
export class MarketplaceDetachController {
  constructor(private marketplaceService: MarketplaceDetachedService, private listingService: ListingDetachedService) {}

  @Post('create')
  @CreateMpOpenApi()
  @Version('1')
  async createMarketplace(@Body() createMarketPlaceDto: CreateMarketPlaceDto, @Req() request: any): Promise<any> {
    console.log('market place creation request received.');

    const result = await this.marketplaceService.createMarketPlace({
      params: createMarketPlaceDto,
      apiKeyId: request.id,
    });

    return {
      success: true,
      message: 'Create marketplace transaction generated successfully',
      result: result,
    };
  }

  @Post('update')
  @UpdateMpOpenApi()
  @Version('1')
  async updateMarketplace(@Body() updateMarketPlaceDto: UpdateMarketplaceDto, @Req() request: any): Promise<any> {
    console.log('market place request received.');

    const result = await this.marketplaceService.updateMarketplace({
      params: updateMarketPlaceDto,
      apiKeyId: request.id,
    });

    return {
      success: true,
      message: 'Update marketplace transaction generated successfully',
      result: result,
    };
  }

  @Post('list')
  @CreateListingOpenApi()
  @Version('1')
  async list(@Body() createListingDto: ListDto, @Req() request: any): Promise<any> {
    console.log('listing creation request received');

    const result = await this.listingService.createListing({
      apiKeyId: request.id,
      params: createListingDto,
    });
    return {
      success: true,
      message: 'Listing transaction created successfully',
      result: result,
    };
  }

  @Post('list_gasless')
  @CreateListingOpenApi()
  @Version('1')
  async listGasless(@Body() createListingDto: ListDto, @Req() request: any): Promise<any> {
    console.log('listing creation request received');
    createListingDto.on_the_house = true;
    const result = await this.listingService.createListing({
      apiKeyId: request.id,
      params: createListingDto,
    });
    return {
      success: true,
      message: 'Listing transaction created successfully',
      result: result,
    };
  }

  @Post('buy')
  @BuyListingOpenApi()
  @Version('1')
  async buy(@Body() buyListedDto: BuyDto): Promise<any> {
    console.log('buy listed item request received');
    const result = await this.listingService.buy(buyListedDto);
    return {
      success: true,
      message: 'Purchase transaction created successfully',
      result: result,
    };
  }

  @Post('unlist')
  @UnlistOpenApi()
  @Version('1')
  async unlist(@Body() unlistDto: UnlistDto): Promise<any> {
    console.log('unlist item request received');
    const result = await this.listingService.cancelListing(unlistDto);
    return {
      success: true,
      message: 'NFT unlist transaction created successfully',
      result: result,
    };
  }

  @Post('withdraw_fee')
  @WithdrawOpenApi()
  @Version('1')
  async withdrawFees(@Body() withdrawFeeDto: WithdrawFeeDto): Promise<any> {
    console.log('withdraw fee request received');
    const result = await this.marketplaceService.withdrawFee(withdrawFeeDto);
    return {
      success: true,
      message: 'Fee withdrawal transaction created successfully',
      result: result,
    };
  }
}
