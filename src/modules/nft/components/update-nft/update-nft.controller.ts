import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateNftDetachDto, UpdateNftDto } from './dto/update.dto';
import { UpdateNftService } from './update-nft.service';
import { Blob } from 'nft.storage';
import { StorageMetadataService } from '../storage-metadata/storage-metadata.service';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { UpdateDetachOpenApi, UpdateOpenApi } from './open-api';
import { RemoteDataFetcherService } from 'src/modules/data-cache/remote-data-fetcher/data-fetcher.service';
import { FetchNftDto } from 'src/modules/data-cache/remote-data-fetcher/dto/data-fetcher.dto';
import { AccountUtils } from 'src/common/utils/account-utils';
import { NftFile } from '../storage-metadata/dto/create-metadata.dto';

/*Should either be
[{"trait_type":"health","value":50}, {"trait_type":"attack","value":100}]
or
{"health":50, "attack":100}
*/
function transformAttributes(attributes) {
  const attr = [];

  if (Array.isArray(attributes)) {
    attributes.map((trait) => {
      attr.push({ trait_type: trait?.trait_type, value: trait?.value });
    });
  } else {
    Object.keys(attributes).map((trait) => {
      attr.push({ trait_type: trait, value: attributes[trait] });
    });
  }
  return attr;
}

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class UpdateNftController {
  constructor(
    private updateNftService: UpdateNftService,
    private storageService: StorageMetadataService,
    private dataFetcher: RemoteDataFetcherService,
  ) { }

  @UpdateOpenApi()
  @Post('update')
  @Version('1')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'data', maxCount: 1 },
  ]))
  async update(
    @UploadedFiles() files: { file?: Express.Multer.File[], data?: Express.Multer.File[] },
    @Body() updateNftDto: UpdateNftDto,
  ): Promise<any> {
    const nftInfo = (await this.dataFetcher.fetchNft(new FetchNftDto(updateNftDto.network, updateNftDto.token_address))).getNftInfoDto();
    let image = nftInfo.image_uri;
    let data: NftFile;
    if (files?.file) {
      const uploadImage = await this.storageService.uploadToIPFS(new Blob([files.file[0].buffer], { type: files.file[0].mimetype }));
      image = uploadImage.uri;
    }

    if (files?.data) {
      const uploadFile = await this.storageService.uploadToIPFS(new Blob([files.data[0].buffer], { type: files.data[0].mimetype }));
      data = new NftFile(uploadFile.uri, files.data[0].mimetype);
    }

    const createParams = {
      network: updateNftDto.network,
      creator: AccountUtils.getKeypair(updateNftDto.private_key).publicKey.toBase58(),
      image,
      name: updateNftDto.name ?? nftInfo.name,
      description: updateNftDto.description ?? nftInfo.description,
      symbol: updateNftDto.symbol ?? nftInfo.symbol,
      attributes: updateNftDto.attributes ? transformAttributes(updateNftDto.attributes) : transformAttributes(nftInfo.attributes),
      royalty: updateNftDto.royalty ?? nftInfo.royalty,
      share: 100,
      external_url: nftInfo.external_url,
      file: data,
    };

    const { uri } = await this.storageService.prepareNFTMetadata(createParams);

    const res = await this.updateNftService.updateNft(uri, {
      ...updateNftDto,
      ...createParams,
      update_authority: nftInfo.update_authority,
      is_mutable: nftInfo.is_mutable,
      primary_sale_happened: nftInfo.primary_sale_happened,
    });

    return {
      success: true,
      message: 'NFT updated',
      result: res,
    };
  }

  @UpdateDetachOpenApi()
  @Post('update_detach')
  @Version('1')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'data', maxCount: 1 },
  ]))
  async updateDetach(
    @UploadedFiles() files: { file: Express.Multer.File[], data?: Express.Multer.File[] },
    @Body() updateNftDetachDto: UpdateNftDetachDto,
  ): Promise<any> {
    const nftInfo = (await this.dataFetcher.fetchNft(new FetchNftDto(updateNftDetachDto.network, updateNftDetachDto.token_address))).getNftInfoDto();
    let image = nftInfo.image_uri;
    let data: NftFile;
    if (files?.file) {
      const uploadImage = await this.storageService.uploadToIPFS(new Blob([files.file[0].buffer], { type: files.file[0].mimetype }));
      image = uploadImage.uri;
    }

    if (files?.data) {
      const uploadFile = await this.storageService.uploadToIPFS(new Blob([files.data[0].buffer], { type: files.data[0].mimetype }));
      data = new NftFile(uploadFile.uri, files.data[0].mimetype);
    }

    const createParams = {
      network: updateNftDetachDto.network,
      creator: updateNftDetachDto.wallet,
      image,
      name: updateNftDetachDto.name ?? nftInfo.name,
      description: updateNftDetachDto.description ?? nftInfo.description,
      symbol: updateNftDetachDto.symbol ?? nftInfo.symbol,
      attributes: updateNftDetachDto.attributes ? transformAttributes(updateNftDetachDto.attributes) : transformAttributes(nftInfo.attributes),
      royalty: updateNftDetachDto.royalty ?? nftInfo.royalty,
      share: 100,
      external_url: nftInfo.external_url,
      file: data,
      serviceCharge: updateNftDetachDto.service_charge,
    };

    const { uri } = await this.storageService.prepareNFTMetadata(createParams);

    const encoded_transaction = await this.updateNftService.updateNftDetach(
      uri,
      {
        ...updateNftDetachDto,
        ...createParams,
        update_authority: nftInfo.update_authority,
        is_mutable: nftInfo.is_mutable,
        primary_sale_happened: nftInfo.primary_sale_happened,
      },
    );

    return {
      success: true,
      message: 'NFT update request generated successfully',
      result: { encoded_transaction },
    };
  }
}
