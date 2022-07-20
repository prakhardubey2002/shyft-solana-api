import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { Network } from '../../../dto/netwotk.dto';

export class TokenBalanceCheckDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: Network,
    description: 'Select solana blockchain environment',
  })
  @IsNotEmpty()
  readonly network: Network;

  @ApiProperty({
    title: 'address',
    type: String,
    description: 'Wallet address',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly wallet: string;

  @ApiProperty({
    title: 'token address',
    type: String,
    description: 'Token address whose balance you want to fetch',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly token: string;
}
