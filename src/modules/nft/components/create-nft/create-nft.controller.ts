import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Blob } from 'nft.storage';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiCreatedResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateNftService } from './create-nft.service';
import { CreateNftDto } from './dto/create-nft.dto';
import { StorageMetadataService } from '../storage-metadata/storage-metadata.service';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class CreateNftController {
  constructor(
    private createNftService: CreateNftService,
    private storageService: StorageMetadataService,
  ) {}
  @ApiOperation({ summary: 'Create NFT' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'NFT created successfully',
    schema: {
      example: {
        success: true,
        message: 'NFT created successfully',
        result: {
          txId: '4qUvyoFd7dfbsdRWiXaTV9zdpCJS7ZAzXGQQET1cFcbaXJ1f539MnDbmKaGGxKDbaFjyJjSJ6UvDk5ytRPqfSPAb',
          mint: 'DYitxNvtLxEsn2SChFfHMTCHhcZHgGhFnZeP8zSCof1X',
          metadata: '8hiAPEukZfWi7sMqZfzyNTmXyR4iGmLb5Z3QNz7CMXe3',
          edition: '9tV1QAsnbDtuvwZDpukoQzaJds7jHenXHZ5bRCrJ1gnU',
        },
      },
    },
  })
  @Post('create')
  @Version('1')
  @UseInterceptors(FileInterceptor('file'))
  async createNft(
    @UploadedFile() file: Express.Multer.File,
    @Body() createNftDto: CreateNftDto,
  ): Promise<any> {
    const uploadImage = await this.storageService.uploadToIPFS(
      new Blob([file.buffer], { type: file.mimetype }),
    );
    const image = uploadImage.uri;
    const { uri } = await this.storageService.prepareMetaData({
      network: createNftDto.network,
      private_key: createNftDto.private_key,
      image,
      name: createNftDto.name,
      description: createNftDto.description,
      symbol: createNftDto.symbol,
      attributes: createNftDto.attributes,
      share: createNftDto.share,
      seller_fee_basis_points: createNftDto.seller_fee_basis_points,
      external_url: createNftDto.externalUrl,
    });
    const mintNftRequest = {
      network: createNftDto.network,
      private_key: createNftDto.private_key,
      metadata_uri: uri,
      max_supply: createNftDto.max_supply,
    };
    const nft = await this.createNftService.mintNft(mintNftRequest);
    return {
      success: true,
      message: 'NFT created successfully',
      result: nft,
    };
  }
}
