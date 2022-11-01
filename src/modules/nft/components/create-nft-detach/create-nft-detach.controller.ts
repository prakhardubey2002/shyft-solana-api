import { Body, Controller, Post, Req, UploadedFiles, UseInterceptors, Version } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { CreateNftDetachService } from './create-nft-detach.service';
import { CreateNftDetachDto } from './dto/create-nft-detach.dto';
import { StorageMetadataService } from '../storage-metadata/storage-metadata.service';
import { CreateNftDetachOpenApi } from './open-api';
import { NftFile } from '../storage-metadata/dto/create-metadata.dto';
import { CreateNftDetachV2Dto } from './dto/create-nft-v2.dto';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class CreateNftDetachController {
  constructor(private createNftDetachService: CreateNftDetachService, private storageService: StorageMetadataService) {}

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
    const { image, data }: { image: string; data: NftFile } = await this.storageService.uploadFilesAndDataToIPFS(files);

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
      file: [data],
    });

    const mintNftRequest = {
      network: createNftDetachDto.network,
      name: createNftDetachDto.name,
      symbol: createNftDetachDto.symbol,
      creatorAddress: createNftDetachDto.wallet,
      metadataUri: uri,
      maxSupply: createNftDetachDto.max_supply,
      royalty: createNftDetachDto.royalty ?? 0,
      userId: request.id,
      nftReceiver: createNftDetachDto?.receiver,
      serviceCharge: createNftDetachDto?.service_charge,
    };

    const result = await this.createNftDetachService.createMasterNft(mintNftRequest);

    return {
      success: true,
      message: 'NFT mint request generated successfully',
      result,
    };
  }

  @CreateNftDetachOpenApi()
  @Post('create')
  @Version('2')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'data', maxCount: 1 },
    ]),
  )
  async createNftV2(
    @UploadedFiles()
    files: { image: Express.Multer.File[]; data?: Express.Multer.File[] },
    @Body() createNftDetachDto: CreateNftDetachV2Dto,
    @Req() request: any,
  ): Promise<any> {
    console.log('create_detach v2 request received');
    const { image, data }: { image: string; data: NftFile } = await this.storageService.uploadFilesAndDataToIPFS({
      file: files.image,
      data: files?.data,
    });

    const { uri } = await this.storageService.prepareNFTMetadata({
      network: createNftDetachDto.network,
      creator: createNftDetachDto.creator_wallet,
      image,
      name: createNftDetachDto.name,
      description: createNftDetachDto.description,
      symbol: createNftDetachDto.symbol,
      attributes: createNftDetachDto.attributes,
      share: 100, //keeping it 100 by default for now createNftDto.share,
      royalty: createNftDetachDto.royalty ?? 0, //500 = 5%
      external_url: createNftDetachDto.external_url,
      file: [data],
    });

    const mintNftRequest = {
      network: createNftDetachDto.network,
      name: createNftDetachDto.name,
      symbol: createNftDetachDto.symbol,
      creatorAddress: createNftDetachDto.creator_wallet,
      collectionAddress: createNftDetachDto.collection_address,
      metadataUri: uri,
      maxSupply: createNftDetachDto.max_supply,
      royalty: createNftDetachDto.royalty ?? 0,
      userId: request.id,
      nftReceiver: createNftDetachDto?.receiver,
      serviceCharge: createNftDetachDto?.service_charge,
      feePayer: createNftDetachDto.fee_payer,
    };

    const result = await this.createNftDetachService.createMasterNft(mintNftRequest);

    return {
      success: true,
      message: 'NFT mint request generated successfully',
      result,
    };
  }
}
