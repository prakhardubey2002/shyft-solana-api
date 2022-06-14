import { Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateNftDto } from './dto/update.dto';
import { UpdateNftService } from './update-nft.service';
import { Blob } from 'nft.storage';
import { CreateNftService } from '../create-nft/create-nft.service';

@Controller('nft')
export class UpdateNftController {
  constructor(private updateNftService: UpdateNftService, private createNftService: CreateNftService) {}
  @Post('update')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  async update(@UploadedFile() file: Express.Multer.File, @Body() updateNftDto: UpdateNftDto): Promise<any>
  {
    const uploadImage = await this.createNftService.uploadToIPFS(
      new Blob([file.buffer], { type: file.mimetype }),
    );
    const image = uploadImage.uri;
    const metaDataURI = await this.createNftService.prepareMetaData({...updateNftDto, maxSupply:undefined},image);

    const res = await this.updateNftService.updateNft(updateNftDto, metaDataURI);
    return {
      success: true,
      message: 'NFT updated',
      result: res,
    };
  }
}
