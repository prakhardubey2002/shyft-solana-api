import { Body, Controller, Post, Req, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { MintTokenService } from './mint-token.service';
import { MintTokenDto } from './dto/mint-token.dto';
import { MintTokenOpenApi } from './open-api';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiInvokeEvent } from 'src/modules/api-monitor/api.event';

@ApiTags('Token')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('token')
export class MintTokenController {
  constructor(private mintTokenService: MintTokenService, private eventEmitter: EventEmitter2) { }

  @MintTokenOpenApi()
  @Post('mint')
  @Version('1')
  async mintToken(@Body() mintTokenDto: MintTokenDto, @Req() request: any): Promise<any> {
    const result = await this.mintTokenService.mintToken(mintTokenDto);

    const nftCreationEvent = new ApiInvokeEvent('token.mint', request.apiKey);
    this.eventEmitter.emit('api.invoked', nftCreationEvent);

    return {
      success: true,
      message: 'Token minted successfully',
      result,
    };
  }
}
