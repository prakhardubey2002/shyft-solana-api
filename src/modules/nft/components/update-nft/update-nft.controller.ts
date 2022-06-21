import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateNftDto } from './dto/update.dto';
import { UpdateNftService } from './update-nft.service';
import { Blob } from 'nft.storage';
import { StorageMetadataService } from '../storage-metadata/storage-metadata.service';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiConsumes,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class UpdateNftController {
  constructor(
    private updateNftService: UpdateNftService,
    private storageService: StorageMetadataService,
  ) {}

  @ApiOperation({ summary: 'Update NFT' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'NFT updated',
    schema: {
      example: {
        success: true,
        message: 'NFT updated',
        result: {
          txId: '5NjF2pzAjE9cJq3xfBsVLf9GYWJRdQqgQ3u6k27CtHKwKr6Mh5zqhVgujqfxYEy6LwWNNahyzsk1zYDhEE8a1jqN',
        },
      },
    },
  })
  @Post('update')
  @Version('1')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateNftDto: UpdateNftDto,
  ): Promise<any> {
    const uploadImage = await this.storageService.uploadToIPFS(
      new Blob([file.buffer], { type: file.mimetype }),
    );
    const image = uploadImage.uri;
    const { uri } = await this.storageService.prepareMetaData({
      network: updateNftDto.network,
      private_key: updateNftDto.private_key,
      image,
      name: updateNftDto.name,
      description: updateNftDto.description,
      symbol: updateNftDto.symbol,
      attributes: updateNftDto.attributes,
      share: updateNftDto.share,
      seller_fee_basis_points: updateNftDto.seller_fee_basis_points,
      external_url: updateNftDto.externalUrl,
    });

    const res = await this.updateNftService.updateNft(updateNftDto, uri);
    return {
      success: true,
      message: 'NFT updated',
      result: res,
    };
  }
}
