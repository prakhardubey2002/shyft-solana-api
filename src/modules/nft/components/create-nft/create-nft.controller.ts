import { Body, Controller, Post, Req, UploadedFiles, UseInterceptors, Version } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Blob } from 'nft.storage';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { CreateNftService } from './create-nft.service';
import { CreateNftDto } from './dto/create-nft.dto';
import { StorageMetadataService } from '../storage-metadata/storage-metadata.service';
import { CreateOpenApi } from './open-api';
import { AccountUtils } from 'src/common/utils/account-utils';
import { NftFile } from '../storage-metadata/dto/create-metadata.dto';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class CreateNftController {
  constructor(private createNftService: CreateNftService, private storageService: StorageMetadataService) {}

  @CreateOpenApi()
  @Post('create')
  @Version('1')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'data', maxCount: 1 },
    ]),
  )
  async createNft(
    @UploadedFiles() files: { file: Express.Multer.File[]; data?: Express.Multer.File[] },
    @Body() createNftDto: CreateNftDto,
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
      network: createNftDto.network,
      creator: AccountUtils.getKeypair(createNftDto.private_key).publicKey.toBase58(),
      image,
      name: createNftDto.name,
      description: createNftDto.description,
      symbol: createNftDto.symbol,
      attributes: createNftDto.attributes,
      share: 100, //keeping it 100 by default for now createNftDto.share,
      royalty: createNftDto.royalty ?? 0, //500 = 5%
      external_url: createNftDto.external_url,
      file: [data],
    });

    const mintNftRequest = {
      name: createNftDto.name,
      symbol: createNftDto.symbol,
      network: createNftDto.network,
      privateKey: createNftDto.private_key,
      metadataUri: uri,
      royalty: createNftDto.royalty,
      maxSupply: createNftDto.max_supply,
      userId: request.id,
      serviceCharge: createNftDto?.service_charge,
      nftReceiver: createNftDto?.receiver,
    };

    const nft = await this.createNftService.createMasterNft(mintNftRequest);

    return {
      success: true,
      message: 'NFT created successfully',
      result: nft,
    };
  }
}
