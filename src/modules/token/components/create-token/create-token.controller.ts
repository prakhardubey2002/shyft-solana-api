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
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { CreateTokenService } from './create-token.service';
import { CreateTokenDto, CreateTokenDetachDto } from './dto/create-token.dto';
import { CreateTokenOpenApi, CreateTokenDetachOpenApi } from './open-api';
import { StorageMetadataService } from 'src/modules/nft/components/storage-metadata/storage-metadata.service';

@ApiTags('Token')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('token')
export class CreateTokenController {
  constructor(
    private createTokenService: CreateTokenService,
    private storageService: StorageMetadataService,
  ) { }

  @CreateTokenOpenApi()
  @Post('create')
  @Version('1')
  @UseInterceptors(FileInterceptor('file'))
  async createToken(
    @UploadedFile() file: Express.Multer.File,
    @Body() createTokenDto: CreateTokenDto,
  ): Promise<any> {
    let image: string;
    if (file) {
      const uploadImage = await this.storageService.uploadToIPFS(
        new Blob([file.buffer], { type: file.mimetype }),
      );
      image = uploadImage.uri;
    }

    const { name, description, symbol } = createTokenDto;

    const { uri } = await this.storageService.prepareTokenMetadata({
      name,
      symbol,
      description,
      image,
    });

    const result = await this.createTokenService.createToken(createTokenDto, uri);

    return {
      success: true,
      message: 'Token created successfully',
      result,
    };
  }

  @CreateTokenDetachOpenApi()
  @Post('create_detach')
  @Version('1')
  @UseInterceptors(FileInterceptor('file'))
  async createTokenDetach(
    @UploadedFile() file: Express.Multer.File,
    @Body() createTokenDetachDto: CreateTokenDetachDto
  ): Promise<any> {
    let image: string;
    if (file) {
      const uploadImage = await this.storageService.uploadToIPFS(
        new Blob([file.buffer], { type: file.mimetype }),
      );
      image = uploadImage.uri;
    }

    const { name, description, symbol } = createTokenDetachDto;

    const { uri } = await this.storageService.prepareTokenMetadata({
      name,
      symbol,
      description,
      image,
    });

    const result = await this.createTokenService.createTokenDetach(createTokenDetachDto, uri);

    return {
      success: true,
      message: 'Token create request generated successfully',
      result,
    };
  }
}
