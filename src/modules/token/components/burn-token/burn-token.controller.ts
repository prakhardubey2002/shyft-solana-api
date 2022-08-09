import { Body, Controller, Delete, Req, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { BurnTokenService } from './burn-token.service';
import { BurnTokenDto, BurnTokenDetachDto } from './dto/burn-token.dto';
import { BurnTokenOpenApi, BurnTokenDetachOpenApi } from './open-api';

@ApiTags('Token')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('token')
export class BurnTokenController {
  constructor(private burnTokenService: BurnTokenService) { }

  @BurnTokenOpenApi()
  @Delete('burn')
  @Version('1')
  async burnToken(@Body() burnTokenDto: BurnTokenDto): Promise<any> {
    const result = await this.burnTokenService.burnToken(burnTokenDto);

    return {
      success: true,
      message: 'Token burned successfully',
      result,
    };
  }

  @BurnTokenDetachOpenApi()
  @Delete('burn_detach')
  @Version('1')
  async burnTokenDetach(@Body() burnTokenDetachDto: BurnTokenDetachDto): Promise<any> {
    const encoded_transaction = await this.burnTokenService.burnTokenDetach(burnTokenDetachDto);

    return {
      success: true,
      message: 'Token burned successfully',
      result: { encoded_transaction },
    };
  }
}
