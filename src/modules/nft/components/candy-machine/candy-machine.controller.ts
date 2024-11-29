import { Controller, Get, Query, Version } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { CandyMachineService } from './candy-machine.service';
import { GetAllMintsDto, GetAllMintsInfoDto } from './dto/candy-machine.dto';
import { GetAllMintsResponse, GetAllMintsInfoResponse } from './open-api';

@ApiTags('Candy Machine')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('candy_machine')
export class CandyMachineController {
  constructor(private candyMachineService: CandyMachineService) {}

  @GetAllMintsResponse()
  @Get('nft_addresses')
  @Version('1')
  async getAllMints(@Query() dto: GetAllMintsDto): Promise<any> {
    const result = await this.candyMachineService.getAllMints(dto);

    return {
      success: true,
      message: `All NFTs minted on this candy machine address: ${dto.address}`,
      result,
    };
  }

  @GetAllMintsInfoResponse()
  @Get('nfts')
  @Version('1')
  async getMintsInfo(@Query() dto: GetAllMintsInfoDto): Promise<any> {
    const result = await this.candyMachineService.getInfo(dto);

    return {
      success: true,
      message: `All NFTs minted on this candy machine address: ${dto.address}`,
      result,
    };
  }
}
