import { Body, Controller, Post, Req, UploadedFile, UseInterceptors, Version } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Blob } from 'nft.storage';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { CreateNftDetachService } from './create-nft-detach.service';
import { CreateNftDetachDto } from './dto/create-nft-detach.dto';
import { StorageMetadataService } from '../storage-metadata/storage-metadata.service';
import { CreateNftDetachOpenApi } from './open-api';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class CreateNftDetachController {
  constructor(private createNftDetachService: CreateNftDetachService, private storageService: StorageMetadataService) { }

  @CreateNftDetachOpenApi()
  @Post('create_detach')
  @Version('1')
  @UseInterceptors(FileInterceptor('file'))
  async createNft(@UploadedFile() file: Express.Multer.File, @Body() createNftDetachDto: CreateNftDetachDto, @Req() request: any): Promise<any> {
    const uploadImage = await this.storageService.uploadToIPFS(new Blob([file.buffer], { type: file.mimetype }));
    const image = uploadImage.uri;

    const { uri } = await this.storageService.prepareNFTMetadata({
      network: createNftDetachDto.network,
      creator: createNftDetachDto.wallet,
      image,
      name: createNftDetachDto.name,
      description: createNftDetachDto.description,
      symbol: createNftDetachDto.symbol,
      attributes: createNftDetachDto.attributes,
      share: 100, //keeping it 100 by default for now createNftDto.share,
      royalty: createNftDetachDto.royalty ?? 0, //500 = 5%
      external_url: createNftDetachDto.external_url,
    });

    const mintNftRequest = {
      network: createNftDetachDto.network,
      name: createNftDetachDto.name,
      symbol: createNftDetachDto.symbol,
      address: createNftDetachDto.wallet,
      metadataUri: uri,
      maxSupply: createNftDetachDto.max_supply,
      royalty: createNftDetachDto.royalty ?? 0,
      userId: request.id,
    };

    const result = await this.createNftDetachService.mintNft(mintNftRequest);

    return {
      success: true,
      message: 'NFT mint request generated successfully',
      result,
    };
  }
}
