import { Body, Controller, HttpException, HttpStatus, Post, Version } from '@nestjs/common';
import { PrintNftEditionDto } from './dto/mint-nft.dto';
import { MintNftService } from './mint-nft.service';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { PrintNftEditionOpenApi } from './open-api';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class MintNftController {
  constructor(private mintNftService: MintNftService) {}

  @PrintNftEditionOpenApi()
  @Post('mint')
  @Version('1')
  async update(@Body() printNftEditionDto: PrintNftEditionDto): Promise<any> {
    try {
      const res = await this.mintNftService.printNewEdition(printNftEditionDto);
      return {
        success: true,
        message: 'NFT Edition printed successfully',
        result: res,
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.FORBIDDEN);
    }
  }
}
