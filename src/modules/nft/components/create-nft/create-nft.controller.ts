import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CreateNftService } from './create-nft.service';
import { CreateNftDto } from './dto/create-nft.dto';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class CreateNftController {
  constructor(private createNftService: CreateNftService) {}
  @ApiOperation({ summary: 'Create NFT' })
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
  async createNft(@Body() creatNftDto: CreateNftDto): Promise<any> {
    const nft = await this.createNftService.mintNft(creatNftDto);
    return {
      success: true,
      message: 'NFT created successfully',
      result: nft,
    };
  }
}
