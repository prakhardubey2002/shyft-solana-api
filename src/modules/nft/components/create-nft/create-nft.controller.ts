import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Blob } from 'nft.storage';
import { CreateNftService } from './create-nft.service';
import { CreateNftDto } from './dto/create-nft.dto';

@Controller('nft')
export class CreateNftController {
  constructor(private createNftService: CreateNftService) {}
  @Post('create-nft')
  @UseInterceptors(FileInterceptor('file'))
  async createNft(
    @UploadedFile() file: Express.Multer.File,
    @Body() creatNftDto: CreateNftDto,
  ): Promise<any> {
    const uploadImage = await this.createNftService.uploadToIPFS(
      new Blob([file.buffer], { type: file.mimetype }),
    );
    const image = uploadImage.uri;
    const metaDataURI = await this.createNftService.prepareMetaData(
      creatNftDto,
      image,
    );
    const nft = await this.createNftService.mintNft(creatNftDto, metaDataURI);
    return {
      success: true,
      message: 'NFT created successfully',
      result: nft,
    };
  }
}
