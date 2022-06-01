import { Body, Controller, Delete } from '@nestjs/common';
import { BurnNftDto } from './dto/burn-nft.dto';
import { BurnNftService } from './burn-nft.service';

@Controller('nft')
export class BurnNftController {
  constructor(private burnNftService: BurnNftService) {}
  @Delete('burn')
  async readNft(@Body() burnNftDto: BurnNftDto): Promise<any> {
    const result = await this.burnNftService.burnNft(burnNftDto);
    return {
      success: true,
      message: 'NFT burned successfully',
      result,
    };
  }
}
