import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ServiceCharge } from 'src/common/utils/utils';

export class CreateNftDetachDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'wallet',
    type: String,
    description: "Creator's wallet's address",
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly wallet: string;

  @ApiProperty({
    title: 'name',
    type: String,
    maxLength: 32,
    description: 'NFT name',
    example: 'fish eyes',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  readonly name: string;

  @ApiProperty({
    title: 'symbol',
    type: String,
    maxLength: 10,
    description: 'NFT symbol',
    example: 'FYE',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  readonly symbol: string;

  @ApiProperty({
    title: 'description',
    type: String,
    description: 'NFT description',
    example: 'Girl with beautiful eyes',
  })
  @IsOptional()
  @IsString()
  readonly description: string;

  @ApiProperty({
    title: 'attributes',
    type: String,
    description: 'Attributes associated to this NFT',
    example: [{ trait_type: 'edification', value: '100' }],
  })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value), { toClassOnly: true })
  attributes: {
    trait_type: string;
    value: string | number;
  }[];

  @ApiPropertyOptional({
    title: 'external_url',
    type: String,
    description: 'An Url to associate with the NFT',
    example: 'https://shyft.to',
  })
  @IsOptional()
  @IsString()
  readonly external_url: string;

  @ApiProperty({
    title: 'max_supply',
    type: Number,
    description: 'Maximum number of clones/edition mints possible for this NFT, defaults to 0',
    example: '1',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  readonly max_supply: number;

  @ApiProperty({
    title: 'royalty',
    type: Number,
    description: 'NFT royalty on secondary sales, between 0 - 100, default 0',
    example: '5',
  })
  @IsOptional()
  @IsNumber()
  @Transform(
    ({ value }) => {
      value = Math.max(0, Math.min(value, 100));
      value = value * 100; // since 100 = 1%
      return value;
    },
    { toClassOnly: true },
  )
  readonly royalty: number;

  @ApiProperty({
    name: 'file',
    description: 'Image that you would want to turn into nft',
    type: String,
    format: 'binary',
  })
  file: string;

  @ApiPropertyOptional({
    name: 'data',
    description: 'Image/pdf/doc/video or any file that you would want to turn into nft',
    type: String,
    format: 'binary',
  })
  @IsOptional()
  data?: string;

  @ApiPropertyOptional({
    name: 'receiver',
    description: 'The address which will receive the created NFT',
    type: String,
    example: '3yTKSCKoDcjBFpbgxyJUh4cM1NG77gFXBimkVBx2hKrf',
  })
  @IsOptional()
  receiver?: string;

  @ApiPropertyOptional({
    name: 'service_charge',
    description: 'You can charge some token/sol for creating nft',
    type: String,
    example: {
      receiver: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
      token: 'DjMA5cCK95X333t7SgkpsG5vC9wMk7u9JV4w8qipvFE8',
      amount: 0.01,
    },
  })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  service_charge?: ServiceCharge;
}
