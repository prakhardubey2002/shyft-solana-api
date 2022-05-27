import { Body, Controller, Post } from '@nestjs/common';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadNftService } from './read-nft.service';

@Controller('nft')
export class ReadNftController {
  constructor(private readNftService: ReadNftService) {}
  @Post('read-nft')
  async readNft(@Body() readNftDto: ReadNftDto): Promise<any> {
    const result = await this.readNftService.readNft(readNftDto);
    return {
      success: true,
      message: 'Your All NFTs',
      result,
    };
  }
}
