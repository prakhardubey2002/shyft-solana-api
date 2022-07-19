import { Controller, Get, Query, Req, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { GetTokenService } from './get-token.service';
import { GetTokenDto } from './dto/get-token.dto';
import { GetTokenOpenApi } from './open-api';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiInvokeEvent } from 'src/modules/api-monitor/api.event';

@ApiTags('Token')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('token')
export class GetTokenController {
  constructor(private getTokenService: GetTokenService, private eventEmitter: EventEmitter2) { }

  @GetTokenOpenApi()
  @Get('get_info')
  @Version('1')
  async getInfo(@Query() getTokenDto: GetTokenDto, @Req() request: any): Promise<any> {
    const result = await this.getTokenService.getToken(getTokenDto);

    const nftCreationEvent = new ApiInvokeEvent('nft.get_info', request.apiKey);
    this.eventEmitter.emit('api.invoked', nftCreationEvent);

    return {
      success: true,
      message: 'Tokens info',
      result,
    };
  }
}
