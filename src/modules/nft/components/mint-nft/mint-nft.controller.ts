import { Body, Controller, HttpException, HttpStatus, Post, Version } from '@nestjs/common';
import { PrintNftEditionDto, PrintNftEditionDetachDto } from './dto/mint-nft.dto';
import { MintNftService } from './mint-nft.service';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { PrintNftEditionOpenApi, PrintNftEditionDetachOpenApi } from './open-api';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class MintNftController {
  constructor(private mintNftService: MintNftService) {}

  @PrintNftEditionOpenApi()
  @Post('mint')
  @Version('1')
  async mint(@Body() printNftEditionDto: PrintNftEditionDto): Promise<any> {
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

  @PrintNftEditionDetachOpenApi()
  @Post('mint_detach')
  @Version('1')
  async mintDetach(@Body() printNftEditionDetachDto: PrintNftEditionDetachDto): Promise<any> {
    const res = await this.mintNftService.printNewEditionDetach(printNftEditionDetachDto);
    return {
      success: true,
      message: 'NFT Edition mint request generated successfully',
      result: res,
    };
  }
}
