import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Blob } from 'nft.storage';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { StorageMetadataService } from './storage-metadata.service';

@ApiSecurity('api_key', ['x-api-key'])
@Controller()
export class StorageMetadataController {
  constructor(
    private readonly storageMetadataService: StorageMetadataService,
  ) {}

  @ApiTags('Storage')
  @ApiOperation({ summary: 'Upload NFT asset' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      title: 'File',
      description: 'File to be uploaded',
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'File uploaded successfully',
    schema: {
      example: {
        success: true,
        message: 'File uploaded successfully',
        result: {
          cid: 'bafkreidw7b75gco2kfvreciexo5b4lakei7xpx6zcktbeyc2xey6hpowa4',
          uri: 'https://ipfs.io/ipfs/bafkreidw7b75gco2kfvreciexo5b4lakei7xpx6zcktbeyc2xey6hpowa4',
        },
      },
    },
  })
  @Post('storage/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File): Promise<any> {
    const uploadResponse = await this.storageMetadataService.uploadToIPFS(
      new Blob([file.buffer], { type: file.mimetype }),
    );
    return {
      success: true,
      message: 'File uploaded successfully',
      result: uploadResponse,
    };
  }

  @ApiTags('Metadata')
  @ApiOperation({ summary: 'Create NFT metadata' })
  @ApiCreatedResponse({
    description: 'Metadata created successfully',
    schema: {
      example: {
        success: true,
        message: 'Metadata created successfully',
        result: {
          cid: 'bafkreifwzh2o2fsyxmcblu7p7rmx4rdlksoepsli3djtlz7jmeknkz446y',
          uri: 'https://ipfs.io/ipfs/bafkreifwzh2o2fsyxmcblu7p7rmx4rdlksoepsli3djtlz7jmeknkz446y',
        },
      },
    },
  })
  @Post('metadata/create')
  async createMetadata(
    @Body() createMetadataDto: CreateMetadataDto,
  ): Promise<any> {
    const metadata = await this.storageMetadataService.prepareMetaData(
      createMetadataDto,
    );
    return {
      success: true,
      message: 'Metadata created successfully',
      result: metadata,
    };
  }
}
