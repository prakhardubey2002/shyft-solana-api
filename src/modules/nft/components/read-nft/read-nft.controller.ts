import { Controller, Get, Query, Req, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ReadAllNftDto } from './dto/read-all-nft.dto';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadNftService } from './read-nft.service';
import { ReadAllOpenApi, ReadOpenApi } from './open-api';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiInvokeEvent } from 'src/modules/api-monitor/api.event';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class ReadNftController {
  constructor(private readNftService: ReadNftService, private eventEmitter: EventEmitter2) { }

  @ReadAllOpenApi()
  @Get('read_all')
  @Version('1')
  async readAllNfts(@Query() readAllNftDto: ReadAllNftDto, @Req() request: any): Promise<any> {
    const result = await this.readNftService.readAllNfts(readAllNftDto);

    const nftCreationEvent = new ApiInvokeEvent('nft.read_all', request.apiKey);
    this.eventEmitter.emit('api.invoked', nftCreationEvent);

    return {
      success: true,
      message: 'All NFTS in your wallet',
      result,
    };
  }

  @ReadOpenApi()
  @Get('read')
  @Version('1')
  async readNft(@Query() readNftDto: ReadNftDto, @Req() request: any): Promise<any> {
    const result = await this.readNftService.readNft(readNftDto);

    const nftCreationEvent = new ApiInvokeEvent('nft.read', request.apiKey);
    this.eventEmitter.emit('api.invoked', nftCreationEvent);

    return {
      success: true,
      message: 'NFT metadata',
      result,
    };
  }
}
