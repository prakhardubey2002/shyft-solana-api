import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Transform } from 'class-transformer';

export class SearchNftsDto {
  @ApiPropertyOptional({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment',
  })
  @IsOptional()
  readonly network?: WalletAdapterNetwork;

  @ApiPropertyOptional({
    title: 'creators',
    type: Array,
    description: "Creator's wallet address",
    example: ['5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg', '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc'],
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  readonly creators?: string[];

  @ApiPropertyOptional({
    title: 'owner',
    type: String,
    description: "Owner of NFT's",
    example: '5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg',
  })
  @IsString()
  @IsOptional()
  readonly owner?: string;

  @ApiPropertyOptional({
    title: 'attributes',
    type: String,
    description: 'Attributes associated',
    example: { edification: { gte: '100' }, energy: '50' },
  })
  @IsOptional()
  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  readonly attributes?: object;

  @ApiPropertyOptional({
    title: 'page',
    type: Number,
    description: 'Page',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  readonly page?: number;

  @ApiPropertyOptional({
    title: 'size',
    type: Number,
    description: 'How many content on a page',
    example: 10,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  readonly size?: number;
}
