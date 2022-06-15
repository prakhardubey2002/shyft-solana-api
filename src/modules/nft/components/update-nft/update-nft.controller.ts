import { Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateNftDto } from './dto/update.dto';
import { UpdateNftService } from './update-nft.service';
import { Blob } from 'nft.storage';
import { StorageMetadataService } from '../storage-metadata/storage-metadata.service';

@Controller('nft')
export class UpdateNftController {
  constructor(private updateNftService: UpdateNftService, private storageService: StorageMetadataService) {}
  @Post('update')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  async update(@UploadedFile() file: Express.Multer.File, @Body() updateNftDto: UpdateNftDto): Promise<any>
  {
    const uploadImage = await this.storageService.uploadToIPFS(
      new Blob([file.buffer], { type: file.mimetype }),
    );
    const image = uploadImage.uri;
    const { uri } = await this.storageService.prepareMetaData({network: updateNftDto.network, private_key: updateNftDto.privateKey,
      image,
      name:updateNftDto.name,
      description: updateNftDto.description,
      symbol: updateNftDto.symbol,
      attributes:updateNftDto.attributes,
      share:updateNftDto.share,
      seller_fee_basis_points: updateNftDto.sellerFeeBasisPoints,
      external_url: updateNftDto.externalUrl});

    const res = await this.updateNftService.updateNft(updateNftDto, uri);
    return {
      success: true,
      message: 'NFT updated',
      result: res,
    };
  }
}
