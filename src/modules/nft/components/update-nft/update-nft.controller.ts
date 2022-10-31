import { Body, Controller, HttpCode, Post, UploadedFiles, UseInterceptors, Version } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateNftDetachDto, UpdateNftDto } from './dto/update.dto';
import { UpdateDetachV2Params, UpdateNftService } from './update-nft.service';
import { Blob } from 'nft.storage';
import { StorageMetadataService } from '../storage-metadata/storage-metadata.service';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { UpdateDetachOpenApi, UpdateDetachV2OpenApi, UpdateOpenApi } from './open-api';
import { RemoteDataFetcherService } from 'src/modules/data-cache/remote-data-fetcher/data-fetcher.service';
import { FetchNftDto } from 'src/modules/data-cache/remote-data-fetcher/dto/data-fetcher.dto';
import { AccountUtils } from 'src/common/utils/account-utils';
import { CreateMetadataV2Dto, NftFile } from '../storage-metadata/dto/create-metadata.dto';
import { UpdateNftDetachV2Dto } from './dto/update-nft-v2.dto';

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
  ) {}

  @UpdateOpenApi()
  @Post('update')
  @Version('1')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'data', maxCount: 1 },
    ]),
  )
  async update(
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; data?: Express.Multer.File[] },
    @Body() updateNftDto: UpdateNftDto,
  ): Promise<any> {
    const nftInfo = (
      await this.dataFetcher.fetchNft(new FetchNftDto(updateNftDto.network, updateNftDto.token_address))
    ).getNftInfoDto();
    let image = nftInfo.image_uri;
    let data: NftFile;
    if (files?.file) {
      const uploadImage = await this.storageService.uploadToIPFS(
        new Blob([files.file[0].buffer], { type: files.file[0].mimetype }),
      );
      image = uploadImage.uri;
    }

    if (files?.data) {
      const uploadFile = await this.storageService.uploadToIPFS(
        new Blob([files.data[0].buffer], { type: files.data[0].mimetype }),
      );
      data = new NftFile(uploadFile.uri, files.data[0].mimetype);
    }

    const createParams = {
      network: updateNftDto.network,
      creator: AccountUtils.getKeypair(updateNftDto.private_key).publicKey.toBase58(),
      image,
      name: updateNftDto.name ?? nftInfo.name,
      description: updateNftDto.description ?? nftInfo.description,
      symbol: updateNftDto.symbol ?? nftInfo.symbol,
      attributes: updateNftDto.attributes
        ? transformAttributes(updateNftDto.attributes)
        : transformAttributes(nftInfo.attributes),
      royalty: updateNftDto.royalty ?? nftInfo.royalty,
      share: 100,
      external_url: nftInfo.external_url,
      file: [data],
    };

    const { uri } = await this.storageService.prepareNFTMetadata(createParams);

    //Code Smell: Difficult to understand what are values of 2nd function input argument.
    //Solution: Use a ServiceDto to pass information from controller to service function (updateNft).
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'data', maxCount: 1 },
    ]),
  )
  async updateDetach(
    @UploadedFiles()
    files: { file: Express.Multer.File[]; data?: Express.Multer.File[] },
    @Body() updateNftDetachDto: UpdateNftDetachDto,
  ): Promise<any> {
    const nftInfo = (
      await this.dataFetcher.fetchNft(new FetchNftDto(updateNftDetachDto.network, updateNftDetachDto.token_address))
    ).getNftInfoDto();

    const { image, data }: { image: string; data: NftFile } = await this.storageService.uploadFilesAndDataToIPFS(files);
    const imageUri = image ?? nftInfo.image_uri;

    const createParams = {
      network: updateNftDetachDto.network,
      creator: updateNftDetachDto.wallet,
      image: imageUri,
      name: updateNftDetachDto.name ?? nftInfo.name,
      description: updateNftDetachDto.description ?? nftInfo.description,
      symbol: updateNftDetachDto.symbol ?? nftInfo.symbol,
      attributes: updateNftDetachDto.attributes
        ? transformAttributes(updateNftDetachDto.attributes)
        : transformAttributes(nftInfo.attributes),
      royalty: updateNftDetachDto.royalty ?? nftInfo.royalty,
      share: 100,
      external_url: nftInfo.external_url,
      file: data ? [data] : nftInfo.files,
      serviceCharge: updateNftDetachDto.service_charge,
    };

    const { uri } = await this.storageService.prepareNFTMetadata(createParams);

    const encoded_transaction = await this.updateNftService.updateNftDetach(uri, {
      ...updateNftDetachDto,
      ...createParams,
      updateAuthority: nftInfo.update_authority,
      isMutable: nftInfo.is_mutable,
      primarySaleHappened: nftInfo.primary_sale_happened,
    });

    return {
      success: true,
      message: 'NFT update request generated successfully',
      result: { encoded_transaction },
    };
  }

  @UpdateDetachV2OpenApi()
  @Post('update')
  @Version('2')
  @HttpCode(200)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'data', maxCount: 1 },
    ]),
  )
  async updateNftV2(
    @UploadedFiles()
    files: { image: Express.Multer.File[]; data?: Express.Multer.File[] },
    @Body() updateNftDto: UpdateNftDetachV2Dto,
  ): Promise<any> {
    const nftData = await this.dataFetcher.fetchNft(new FetchNftDto(updateNftDto.network, updateNftDto.token_address));
    const nftInfo = nftData.getNftInfoDto();

    const { image, data }: { image: string; data: NftFile } = await this.storageService.uploadFilesAndDataToIPFS({
      file: files.image,
      data: files?.data,
    });
    const imageUri = image ?? nftInfo.image_uri;

    const createParams = {
      network: updateNftDto.network,
      tokenAddress: updateNftDto.token_address,
      creators: nftData.onChainMetadata.creators,
      updateAuthorityAddress: updateNftDto.update_authority_address,
      image: imageUri,
      name: updateNftDto.name ?? nftInfo.name,
      description: updateNftDto.description ?? nftInfo.description,
      symbol: updateNftDto.symbol ?? nftInfo.symbol,
      attributes: updateNftDto.attributes
        ? transformAttributes(updateNftDto.attributes)
        : transformAttributes(nftInfo.attributes),
      royalty: updateNftDto.royalty ?? nftInfo.royalty,
      externalUrl: nftInfo.external_url,
      file: data ? [data] : nftInfo.files,
      isMutable: nftInfo.is_mutable,
      primarySaleHappend: nftInfo.primary_sale_happened,
      feePayer: updateNftDto.fee_payer,
      serviceCharge: updateNftDto.service_charge,
      collection: nftData.onChainMetadata.collection
        ? {
            verified: nftData.onChainMetadata.collection.verified,
            key: nftData.onChainMetadata.collection.address,
          }
        : null,
    };

    const createMetadataV2Dto = new CreateMetadataV2Dto();
    createMetadataV2Dto.network = createParams.network;
    createMetadataV2Dto.creators = createParams.creators;
    createMetadataV2Dto.image = imageUri;
    createMetadataV2Dto.name = createParams.name;
    createMetadataV2Dto.symbol = createParams.symbol;
    createMetadataV2Dto.description = createParams.description;
    createMetadataV2Dto.attributes = createParams.attributes;
    createMetadataV2Dto.externalUrl = createParams.externalUrl;
    createMetadataV2Dto.royalty = createParams.royalty;
    createMetadataV2Dto.file = createParams.file;

    const { uri } = await this.storageService.prepareNFTMetadataV2(createMetadataV2Dto);

    const updateDetachV2Params: UpdateDetachV2Params = {
      network: createParams.network,
      tokenAddress: createParams.tokenAddress,
      updateAuthorityAddress: createParams.updateAuthorityAddress,
      creators: createParams.creators,
      royalty: createParams.royalty,
      isMutable: createParams.isMutable,
      primarySaleHappened: createParams.primarySaleHappend,
      collection: createParams.collection,
      name: createParams.name,
      symbol: createParams.symbol,
      feePayer: createParams.feePayer,
      serviceCharge: createParams.serviceCharge,
    };
    const encoded_transaction = await this.updateNftService.updateNftDetachV2(uri, updateDetachV2Params);

    return {
      success: true,
      message: 'NFT update request generated successfully',
      result: { encoded_transaction },
    };
  }
}
