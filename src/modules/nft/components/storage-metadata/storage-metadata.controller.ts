import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Blob } from 'nft.storage';
import { StorageUploadOpenApi, MetadataCreateOpenApi } from './open-api';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { StorageMetadataService } from './storage-metadata.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiInvokeEvent } from 'src/modules/api-monitor/api.event';

@ApiSecurity('api_key', ['x-api-key'])
@Controller()
export class StorageMetadataController {
  constructor(
    private readonly storageMetadataService: StorageMetadataService,
    private eventEmitter: EventEmitter2
  ) { }

  @StorageUploadOpenApi()
  @Post('storage/upload')
  @Version('1')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() request: any): Promise<any> {
    const uploadResponse = await this.storageMetadataService.uploadToIPFS(
      new Blob([file.buffer], { type: file.mimetype }),
    );

    const nftCreationEvent = new ApiInvokeEvent('storage.upload', request.apiKey);
    this.eventEmitter.emit('api.invoked', nftCreationEvent);

    return {
      success: true,
      message: 'File uploaded successfully',
      result: uploadResponse,
    };
  }

  @MetadataCreateOpenApi()
  @Post('metadata/create')
  @Version('1')
  async createMetadata(
    @Body() createMetadataDto: CreateMetadataDto,
    @Req() request: any
  ): Promise<any> {
    const metadata = await this.storageMetadataService.prepareNFTMetadata(
      createMetadataDto,
    );

    const nftCreationEvent = new ApiInvokeEvent('metadata.create', request.apiKey);
    this.eventEmitter.emit('api.invoked', nftCreationEvent);

    return {
      success: true,
      message: 'Metadata created successfully',
      result: metadata,
    };
  }
}
