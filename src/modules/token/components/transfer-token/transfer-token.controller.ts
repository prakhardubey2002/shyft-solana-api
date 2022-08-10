import { Body, Controller, Post, Req, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { TransferTokenService } from './transfer-token.service';
import { TransferTokenDto, TransferTokenDetachDto } from './dto/transfer-token.dto';
import { TransferTokenOpenApi, TransferTokenDetachOpenApi } from './open-api';

@ApiTags('Token')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('token')
export class TransferTokenController {
  constructor(private transferService: TransferTokenService) { }

  @TransferTokenOpenApi()
  @Post('transfer')
  @Version('1')
  async transferToken(@Body() transferTokenDto: TransferTokenDto): Promise<any> {
    const result = await this.transferService.transferToken(transferTokenDto);

    return {
      success: true,
      message: 'Token transfered successfully',
      result,
    };
  }

  @TransferTokenDetachOpenApi()
  @Post('transfer_detach')
  @Version('1')
  async transferTokenDetach(@Body() transferTokenDetachDto: TransferTokenDetachDto): Promise<any> {
    const result = await this.transferService.transferTokenDetach(transferTokenDetachDto);

    return {
      success: true,
      message: 'Transfer token request generated successfully',
      result,
    };
  }
}
