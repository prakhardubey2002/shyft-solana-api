import { Body, Controller, Delete, Req, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { BurnNftDto } from './dto/burn-nft.dto';
import { BurnNftService } from './burn-nft.service';
import { BurnOpenApi } from './open-api';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiInvokeEvent } from 'src/modules/api-monitor/api.event';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class BurnNftController {
  constructor(private burnNftService: BurnNftService, private eventEmitter: EventEmitter2) { }
  @BurnOpenApi()
  @Delete('burn')
  @Version('1')
  async burnNft(@Body() burnNftDto: BurnNftDto, @Req() request: any): Promise<any> {
    const result = await this.burnNftService.burnNft(burnNftDto);

    const nftCreationEvent = new ApiInvokeEvent('nft.burn', request.apiKey);
    this.eventEmitter.emit('api.invoked', nftCreationEvent);

    return {
      success: true,
      message: 'NFT burned successfully',
      result,
    };
  }
}
