import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Blob } from 'nft.storage';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { CreateNftDetachService } from './create-nft-detach.service';
import { CreateNftDetachDto } from './dto/create-nft-detach.dto';
import { StorageMetadataService } from '../storage-metadata/storage-metadata.service';
import { CreateNftDetachOpenApi } from './open-api';
import { NftFile } from '../storage-metadata/dto/create-metadata.dto';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class CreateNftDetachController {
  constructor(
    private createNftDetachService: CreateNftDetachService,
    private storageService: StorageMetadataService,
  ) {}

  @CreateNftDetachOpenApi()
  @Post('create_detach')
  @Version('1')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'data', maxCount: 1 },
    ]),
  )
  async createNft(
    @UploadedFiles()
    files: { file: Express.Multer.File[]; data?: Express.Multer.File[] },
    @Body() createNftDetachDto: CreateNftDetachDto,
    @Req() request: any,
  ): Promise<any> {
    let image: string;
    if (files.file) {
      const uploadImage = await this.storageService.uploadToIPFS(
        new Blob([files.file[0].buffer], { type: files.file[0].mimetype }),
      );
      image = uploadImage.uri;
    }

    let data: NftFile;

    if (files.data) {
      const uploadFile = await this.storageService.uploadToIPFS(
        new Blob([files.data[0].buffer], { type: files.data[0].mimetype }),
      );
      data = new NftFile(uploadFile.uri, files.data[0].mimetype);
    }

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
      file: data,
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
      serviceCharge: createNftDetachDto?.service_charge,
    };

    const result = await this.createNftDetachService.createMasterNft(
      mintNftRequest,
    );

    return {
      success: true,
      message: 'NFT mint request generated successfully',
      result,
    };
  }
}
