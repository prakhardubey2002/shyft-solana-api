import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Blob } from 'nft.storage';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { StorageMetadataService } from './storage-metadata.service';

@Controller()
export class StorageMetadataController {
  constructor(
    private readonly storageMetadataService: StorageMetadataService,
  ) {}
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
