import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { Controller, Get, Query, Req, Version } from '@nestjs/common';
import { SearchNftService } from './search-nft.service';
import { SearchAttributesOpenApi, SearchOpenApi } from './open-api';
import { SearchNftsDto } from './dto/search-nfts.dto';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class SearchNftcontroller {
  constructor(private searchNftService: SearchNftService) {}

  @SearchAttributesOpenApi()
  @Get('search/attributes')
  @Version('1')
  async searchNft(@Query() query, @Req() request: any): Promise<any> {
    const result = await this.searchNftService.searchNftsByAttributes(
      query,
      request.id,
    );

    return {
      success: true,
      message: 'filtered NFTs',
      result: result,
    };
  }

  @SearchOpenApi()
  @Get('search')
  @Version('1')
  async searchNfts(@Query() query: SearchNftsDto): Promise<any> {
    const result = await this.searchNftService.searchNfts(query);
    let message = 'filtered NFTs';
    if (result.nfts.length === 0) {
      message = 'Please hit sol/v1/nft/read_all api first';
    }

    return {
      success: true,
      message,
      result: result,
    };
  }
}
