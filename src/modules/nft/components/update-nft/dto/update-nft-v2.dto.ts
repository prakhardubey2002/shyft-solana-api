import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ServiceCharge } from 'src/common/utils/utils';

export class UpdateNftDetachV2Dto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'token_address',
    type: String,
    description: 'address of the NFT to be updated',
    example: 'HJ32KZye152eCFQYrKDcoyyq77dVDpa8SXE6v8T1HkBP',
  })
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;

  @ApiProperty({
    title: 'update_authority_address',
    type: String,
    description: 'Address of update authority of NFT',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly update_authority_address: string;

  @ApiPropertyOptional({
    title: 'name',
    type: String,
    maxLength: 32,
    description: 'NFT name',
    example: 'Shyft',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly name?: string;

  @ApiPropertyOptional({
    title: 'symbol',
    type: String,
    maxLength: 10,
    description: 'NFT symbol',
    example: 'SHY',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  readonly symbol?: string;

  @ApiPropertyOptional({
    title: 'description',
    type: String,
    description: 'NFT description',
    example: 'Shyft makes web3 development easy',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiPropertyOptional({
    title: 'attributes',
    type: String,
    description: 'Attributes associated to this NFT',
    example: [{ trait_type: 'edification', value: '100' }],
  })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value), { toClassOnly: true })
  attributes?: {
    trait_type: string;
    value: string | number;
  }[];

  @ApiPropertyOptional({
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
  readonly royalty?: number;

  @ApiPropertyOptional({
    name: 'image',
    description: 'Image that you would want to turn into nft',
    type: String,
    format: 'binary',
  })
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    name: 'data',
    description: 'Image/pdf/doc/video or any file that you would want to turn into nft',
    type: String,
    format: 'binary',
  })
  @IsOptional()
  data?: string;

  @ApiPropertyOptional({
    name: 'fee_payer',
    description: 'The account that will pay the gas fee for this transaction',
    type: String,
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsOptional()
  @IsString()
  fee_payer?: string;

  @ApiPropertyOptional({
    name: 'service_charge',
    description: 'You can charge some token/sol for updating nft',
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
