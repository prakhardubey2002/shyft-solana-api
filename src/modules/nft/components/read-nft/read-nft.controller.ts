import { Body, Controller, HttpCode, Post, Version } from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ReadAllNftDto } from './dto/read-all-nft.dto';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadNftService } from './read-nft.service';
import { ReadAllOpenApi, ReadOpenApi } from './open-api';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class ReadNftController {
  constructor(private readNftService: ReadNftService) {}

  @ReadAllOpenApi()
  @Post('read_all')
  @Version('1')
  @HttpCode(200)
  async readAllNfts(@Body() readAllNftDto: ReadAllNftDto): Promise<any> {
    const result = await this.readNftService.readAllNfts(readAllNftDto);
    return {
      success: true,
      message: 'Your all NFTs',
      result,
    };
  }

  @ReadOpenApi()
  @Post('read')
  @Version('1')
  @HttpCode(200)
  async readNft(@Body() readNftDto: ReadNftDto): Promise<any> {
    const result = await this.readNftService.readNft(readNftDto);
    return {
      success: true,
      message: 'NFT metadata',
      result,
    };
  }
}
