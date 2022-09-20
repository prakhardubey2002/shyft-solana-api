import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorators';
import { GetApiKeyDto } from './dto/get-api-key.dto';
import { WhiteListDomainsDto } from './dto/whitelist-domains.dto';

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
        result: {
          api_key: 'Pi3dU50L4p5F087o',
        },
      },
    },
  })
  @Post('get_api_key')
  @Version('1')
  @HttpCode(200)
  @Public()
  async getApiKey(@Body() getApiKeyDto: GetApiKeyDto): Promise<any> {
    const result = await this.appService.getApiKey(getApiKeyDto);
    return {
      success: true,
      message: 'API key sent successfully to your email.',
      result,
    };
  }

  @ApiExcludeEndpoint()
  @Put('whitelist_domains')
  @Version('1')
  @HttpCode(200)
  @Public()
  async whiteListDomain(
    @Body() whiteListDomainsDto: WhiteListDomainsDto,
  ): Promise<any> {
    console.log('domain whitelisting request received');
    const result = await this.appService.whiteListDomain(whiteListDomainsDto);
    return {
      success: true,
      message: 'domains successfully whitelisted',
      result,
    };
  }

  @ApiExcludeEndpoint()
  @Put('remove_whitelist_domains')
  @Version('1')
  @HttpCode(200)
  @Public()
  async deleteWhiteListDomain(
    @Body() whiteListDomainsDto: WhiteListDomainsDto,
  ): Promise<any> {
    console.log('remove whitelisted domains request received');
    const result = await this.appService.deleteDomainFromWhiteList(
      whiteListDomainsDto,
    );
    return {
      success: true,
      message: 'domain successfully removed from whitelist',
      result,
    };
  }
}
