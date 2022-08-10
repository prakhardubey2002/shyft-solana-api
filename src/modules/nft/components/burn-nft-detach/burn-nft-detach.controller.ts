import { Body, Controller, Delete, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { BurnNftDetachDto } from './dto/burn-nft-detach.dto';
import { BurnNftDetachService } from './burn-nft-detach.service';
import { BurnOpenApi } from './open-api';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class BurnNftDetachController {
  constructor(private burnNftDetachService: BurnNftDetachService) { }
  @BurnOpenApi()
  @Delete('burn_detach')
  @Version('1')
  async burnNft(@Body() burnNftDetachDto: BurnNftDetachDto): Promise<any> {
    const encoded_transaction = await this.burnNftDetachService.burnNft(burnNftDetachDto);

    return {
      success: true,
      message: 'NFT burn request created successfully',
      result: { encoded_transaction },
    };
  }
}
