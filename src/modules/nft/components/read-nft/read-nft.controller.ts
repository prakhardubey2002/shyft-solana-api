import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ReadAllNftDto } from './dto/read-all-nft.dto';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadNftService } from './read-nft.service';

@Controller('nft')
export class ReadNftController {
  constructor(private readNftService: ReadNftService) {}
  @Post('read_all')
  @HttpCode(200)
  async readAllNfts(@Body() readAllNftDto: ReadAllNftDto): Promise<any> {
    const result = await this.readNftService.readAllNfts(readAllNftDto);
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
