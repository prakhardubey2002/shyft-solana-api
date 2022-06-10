import { Body, Controller, Post } from '@nestjs/common';
import { CreateNftService } from './create-nft.service';
import { CreateNftDto } from './dto/create-nft.dto';

@Controller('nft')
export class CreateNftController {
  constructor(private createNftService: CreateNftService) {}
  @Post('create')
  async createNft(@Body() creatNftDto: CreateNftDto): Promise<any> {
    const nft = await this.createNftService.mintNft(creatNftDto);
    return {
      success: true,
      message: 'NFT created successfully',
      result: nft,
    };
  }
}
