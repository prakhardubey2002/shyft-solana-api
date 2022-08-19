import { Controller, Get, Query, Req, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ReadAllNftDto, ReadAllNftByCreatorDto } from './dto/read-all-nft.dto';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadNftService } from './read-nft.service';
import { ReadAllOpenApi, ReadOpenApi } from './open-api';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class ReadNftController {
  constructor(private readNftService: ReadNftService) { }

  @ReadAllOpenApi()
  @Get('read_all')
  @Version('1')
  async readAllNfts(@Query() readAllNftDto: ReadAllNftDto): Promise<any> {
    const result = await this.readNftService.readAllNfts(readAllNftDto);

    return {
      success: true,
      message: 'All NFTS in your wallet',
      result,
    };
  }

  @Get('read_all_by_creator')
  @Version('1')
  async readAllNftsByCreator(@Query() readAllNftByCreatorDto: ReadAllNftByCreatorDto): Promise<any> {
    const result = await this.readNftService.readAllNftsByCreator(readAllNftByCreatorDto);

    return {
      success: true,
      message: 'All NFTS in your wallet',
      result,
    };
  }


  @ReadOpenApi()
  @Get('read')
  @Version('1')
  async readNft(@Query() readNftDto: ReadNftDto): Promise<any> {
    const result = await this.readNftService.readNft(readNftDto);

    return {
      success: true,
      message: 'NFT metadata',
      result,
    };
  }
}
