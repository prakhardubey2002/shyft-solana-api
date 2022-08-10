import { Body, Controller, Post, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { MintTokenService } from './mint-token.service';
import { MintTokenDto, MintTokenDetachDto } from './dto/mint-token.dto';
import { MintTokenOpenApi, MintTokenDetachOpenApi } from './open-api';

@ApiTags('Token')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('token')
export class MintTokenController {
  constructor(private mintTokenService: MintTokenService) { }

  @MintTokenOpenApi()
  @Post('mint')
  @Version('1')
  async mintToken(@Body() mintTokenDto: MintTokenDto): Promise<any> {
    const result = await this.mintTokenService.mintToken(mintTokenDto);

    return {
      success: true,
      message: 'Token minted successfully',
      result,
    };
  }

  @MintTokenDetachOpenApi()
  @Post('mint_detach')
  @Version('1')
  async mintTokenDetach(@Body() mintTokenDetachDto: MintTokenDetachDto): Promise<any> {
    const result = await this.mintTokenService.mintTokenDetach(mintTokenDetachDto);

    return {
      success: true,
      message: 'Token mint request generated successfully',
      result,
    };
  }
}
