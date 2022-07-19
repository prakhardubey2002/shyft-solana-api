import { Body, Controller, Delete, Req, Version } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ApiInvokeEvent } from 'src/modules/api-monitor/api.event';
import { BurnTokenService } from './burn-token.service';
import { BurnTokenDto } from './dto/burn-token.dto';
import { BurnTokenOpenApi } from './open-api';

@ApiTags('Token')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('token')
export class BurnTokenController {
  constructor(private burnTokenService: BurnTokenService, private eventEmitter: EventEmitter2) { }

  @BurnTokenOpenApi()
  @Delete('burn')
  @Version('1')
  async burnToken(@Body() burnTokenDto: BurnTokenDto, @Req() request: any): Promise<any> {
    const result = await this.burnTokenService.burnToken(burnTokenDto);

    const nftCreationEvent = new ApiInvokeEvent('token.burn', request.apiKey);
    this.eventEmitter.emit('api.invoked', nftCreationEvent);

    return {
      success: true,
      message: 'Token burned successfully',
      result,
    };
  }
}
