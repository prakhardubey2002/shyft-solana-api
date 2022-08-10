import { Body, Controller, Post, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { TransferNftDto, TransferNftDetachDto } from './dto/transfer.dto';
import { TransferNftService } from './transfer-nft.service';
import { TransferOpenApi, TransferDetachOpenApi } from './open-api';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class TransferNftController {
  constructor(private transferService: TransferNftService) {}

  @TransferOpenApi()
  @Post('transfer')
  @Version('1')
  async transferNft(@Body() transferNftDto: TransferNftDto): Promise<any> {
    const res = await this.transferService.transferNft(transferNftDto);

    return {
      success: true,
      message: 'NFT Transfer',
      result: res,
    };
  }

  @TransferDetachOpenApi()
  @Post('transfer_detach')
  @Version('1')
  async transferNftDetach(@Body() transferNftDetachDto: TransferNftDetachDto): Promise<any> {
    const res = await this.transferService.transferNftDetach(transferNftDetachDto);

    return {
      success: true,
      message: 'Transfer NFT request generated successfully',
      result: res,
    };
  }
}
