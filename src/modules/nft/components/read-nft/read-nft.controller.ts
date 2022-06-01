import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadNftService } from './read-nft.service';

@Controller('nft')
export class ReadNftController {
  constructor(private readNftService: ReadNftService) {}
  @Post('read_all')
  @HttpCode(200)
  async readAllNfts(@Body() readNftDto: ReadNftDto): Promise<any> {
    const result = await this.readNftService.readAllNfts(readNftDto);
    return {
      success: true,
      message: 'Your all NFTs',
      result,
    };
  }

  @Post('read')
  @HttpCode(200)
  async readNft(@Body() readNftDto: ReadNftDto): Promise<any> {
    const result = await this.readNftService.readNft(readNftDto);
    return {
      success: true,
      message: 'NFT metadata',
      result,
    };
  }
}
