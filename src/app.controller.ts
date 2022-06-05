import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorators';
import { GetApiKeyDto } from './dto/get-api-key.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('get_api_key')
  @Public()
  async getApiKey(@Body() getApiKeyDto: GetApiKeyDto): Promise<any> {
    const result = await this.appService.getApiKey(getApiKeyDto);
    return {
      success: true,
      message: 'API key sent successfully to your email.',
      result,
    };
  }
}
