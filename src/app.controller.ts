import { Body, Controller, Get, HttpCode, Post, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorators';
import { GetApiKeyDto } from './dto/get-api-key.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiTags('Root Route')
  @ApiOperation({ summary: 'Shyft API entry endpoint' })
  @ApiOkResponse({
    description: 'Welcome to Shyft APIs',
    schema: { example: 'Welcome to Shyft APIs' },
  })
  @Get()
  @Version('1')
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiTags('Get API key')
  @ApiOperation({ summary: 'Get API key on your email' })
  @ApiOkResponse({
    description: 'API key sent successfully to your email.',
    schema: {
      example: {
        success: true,
        message: 'API key sent successfully to your email.',
      },
    },
  })
  @Post('get_api_key')
  @Version('1')
  @HttpCode(200)
  @Public()
  async getApiKey(@Body() getApiKeyDto: GetApiKeyDto): Promise<any> {
    await this.appService.getApiKey(getApiKeyDto);
    return {
      success: true,
      message: 'API key sent successfully to your email.',
    };
  }
}
