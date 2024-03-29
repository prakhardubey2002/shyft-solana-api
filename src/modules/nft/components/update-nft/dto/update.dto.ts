import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ServiceCharge } from 'src/common/utils/utils';

export class UpdateNftDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment ',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'private_key',
    type: String,
    description: "NFT holder's wallet's private key",
    example: '5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v',
  })
  @IsNotEmpty()
  @IsString()
  readonly private_key: string;

  @ApiProperty({
    title: 'token_address',
    type: String,
    description: 'address of the NFT to be updated',
    example: 'HJ32KZye152eCFQYrKDcoyyq77dVDpa8SXE6v8T1HkBP',
  })
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;

  @ApiPropertyOptional({
    title: 'name',
    type: String,
    maxLength: 32,
    description: 'Name of the NFT',
    example: 'Shyft',
  })
  @IsString()
  @IsOptional()
  @MaxLength(32)
  readonly name: string;

  @ApiPropertyOptional({
    title: 'new_update_authority',
    type: String,
    description: 'New update authority',
    example: '97a3giHcGsk8YoEgWv4rP1ooWwJBgS72fpckZM6mQiFH',
  })
  @IsString()
  @IsOptional()
  readonly new_update_authority: string;

  @ApiPropertyOptional({
    title: 'symbol',
    type: String,
    maxLength: 10,
    description: 'NFT symbol',
    example: 'SH',
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  readonly symbol: string;

  @ApiPropertyOptional({
    title: 'description',
    type: String,
    description: 'NFT description',
    example: 'Shyft makes web3 development easy',
  })
  @IsString()
  @IsOptional()
  readonly description: string;

  @ApiPropertyOptional({
    title: 'attributes',
    type: Object,
    description: 'attributes associated to this NFT ',
    example: [{ trait_type: 'edification', value: '100' }],
  })
  @Transform(({ value }) => JSON.parse(value), { toClassOnly: true })
  @IsOptional()
  attributes: object;

  @ApiPropertyOptional({
    title: 'seller_fee_basis_points',
    type: String,
    description: 'NFT royalty on secondary sales, between 0 - 100',
    example: '100',
  })
  @IsNumber()
  @Transform(
    ({ value }) => {
      value = Math.max(0, Math.min(value, 100));
      value = value * 100; // since 100 = 1%
      return value;
    },
    { toClassOnly: true },
  )
  @IsOptional()
  readonly royalty: number;

  @ApiPropertyOptional({
    name: 'file',
    description: 'Image that you would want to turn into nft',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  file?: string;

  @ApiPropertyOptional({
    name: 'data',
    description: 'Image/pdf/doc/video or any file that you would want to turn into nft',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  data?: string;
}

export class UpdateNftDetachDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment ',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'wallet',
    type: String,
    description: "NFT holder's wallet's address",
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly wallet: string;

  @ApiProperty({
    title: 'token_address',
    type: String,
    description: 'address of the NFT to be updated',
    example: 'HJ32KZye152eCFQYrKDcoyyq77dVDpa8SXE6v8T1HkBP',
  })
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;

  @ApiPropertyOptional({
    title: 'name',
    type: String,
    maxLength: 32,
    description: 'Name of the NFT',
    example: 'Shyft',
  })
  @IsString()
  @IsOptional()
  @MaxLength(32)
  readonly name: string;

  @ApiPropertyOptional({
    title: 'symbol',
    type: String,
    maxLength: 10,
    description: 'NFT symbol',
    example: 'SH',
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  readonly symbol: string;

  @ApiPropertyOptional({
    title: 'description',
    type: String,
    description: 'NFT description',
    example: 'Shyft makes web3 development easy',
  })
  @IsString()
  @IsOptional()
  readonly description: string;

  @ApiPropertyOptional({
    title: 'attributes',
    type: Object,
    description: 'attributes associated to this NFT ',
    example: [{ trait_type: 'edification', value: '100' }],
  })
  @Transform(({ value }) => JSON.parse(value), { toClassOnly: true })
  @IsOptional()
  attributes: object;

  @ApiPropertyOptional({
    title: 'seller_fee_basis_points',
    type: String,
    description: 'NFT royalty on secondary sales, between 0 - 100',
    example: '100',
  })
  @IsNumber()
  @Transform(
    ({ value }) => {
      value = Math.max(0, Math.min(value, 100));
      value = value * 100; // since 100 = 1%
      return value;
    },
    { toClassOnly: true },
  )
  @IsOptional()
  readonly royalty: number;

  @ApiPropertyOptional({
    name: 'file',
    description: 'Image that you would want to turn into nft',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  file?: string;

  @ApiPropertyOptional({
    name: 'data',
    description: 'Image/pdf/doc/video or any file that you would want to turn into nft',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  data?: string;

  @ApiPropertyOptional({
    name: 'service_charge',
    description: 'You can charge some token/sol for updating nft',
    type: 'string',
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
