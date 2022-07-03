import { Body, Controller, Post, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { MintTokenService } from './mint-token.service';
import { MintTokenDto } from './dto/mint-token.dto';
import { MintTokenOpenApi } from './open-api';

@ApiTags('Token')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('token')
export class MintTokenController {
  constructor(private mintTokenService: MintTokenService) {}

  @MintTokenOpenApi()
  @Post('mint')
  @Version('1')
  async createToken(@Body() mintTokenDto: MintTokenDto): Promise<any> {
    const result = await this.mintTokenService.mintToken(mintTokenDto);
    return {
      success: true,
      message: 'Token minted successfully',
      result,
    };
  }
}
