import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class TransferNftDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment ',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'Address of the NFT',
    type: String,
    description: 'address of the NFT to be transfered',
    example: 'HJ32KZye152eCFQYrKDcoyyq77dVDpa8SXE6v8T1HkBP',
  })
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;

  @ApiProperty({
    title: 'Private key of wallet containing the NFT',
    type: String,
    description: 'Private Key of the wallet containing the NFT to be transfered',
    example: 'HJ32KZye152eCFQYrKDcoyyq77dVDpa8SXE6v8T1HkBP',
  })
  @IsNotEmpty()
  @IsString()
  readonly from_address: string;

  @ApiProperty({
    title: 'To Wallet Address',
    type: String,
    description: 'address of the wallet to which the NFT will be transfered',
    example: 'HJ32KZye152eCFQYrKDcoyyq77dVDpa8SXE6v8T1HkBP',
  })
  @IsNotEmpty()
  @IsString()
  readonly to_address: string;

  @ApiPropertyOptional({
    title: 'Transfer Authority',
    type: Boolean,
    description: 'Transfer update authority to the receiver or not, default TRUE',
    example: 'true',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value ?? true;
  })
  readonly transfer_authority: string;
}

export class TransferNftDetachDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment ',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'Address of the NFT',
    type: String,
    description: 'address of the NFT to be transfered',
    example: 'HJ32KZye152eCFQYrKDcoyyq77dVDpa8SXE6v8T1HkBP',
  })
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;

  @ApiProperty({
    title: 'Address of wallet containing the NFT',
    type: String,
    description: 'Address of the wallet containing the NFT to be transfered',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly from_address: string;

  @ApiProperty({
    title: 'To Wallet Address',
    type: String,
    description: 'Address of the wallet to which the NFT will be transfered',
    example: 'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R',
  })
  @IsNotEmpty()
  @IsString()
  readonly to_address: string;

  @ApiPropertyOptional({
    title: 'Transfer Authority',
    type: Boolean,
    description: 'Transfer update authority to the receiver or not, default TRUE',
    example: 'true',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value ?? true;
  })
  readonly transfer_authority: boolean;
}

export class TransferMultipleNftDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment ',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'NFT Adresses',
    type: Array,
    description: 'addresses of the NFT to be transfered',
    example: [
      'GFxYSwRPWxDBdGex4DhrY2dStHPMn4UoocJyBAdfypsa',
      '6RXZGEmQmUJUXR4jKqb9xJ4dPGbviiHfXgpYHWs81fM8',
      '8pNjm9UmY6RhGQaLuCdtDt6uXhqXg5rFQX9t2oWq3PL1',
      'CHqQS4sZCqKvkvgsKnar5FB4aQ1Ps6mLxBfdNjRgHYqS',
      'FSwx4c1qhuwr3YpBHHCneWkvo2R9uPuHoqjfr6qgixTh',
      'AmeH6zUfie2gkFrT7ZZJcimsCCMhtk8PtTKD3Yxitvs5',
      '9eEJEUwsuHDDXPv6LZf84xAYJM8wRkQt56zDB1oig5za',
      'CxKYibvYT9H8qBw827LvGuz6BWvXSsSJSeCsbm5t27hN',
    ],
  })
  @IsNotEmpty()
  @IsArray()
  readonly token_addresses: string[];

  @ApiProperty({
    title: "NFT owner's wallet address",
    type: String,
    description: 'Address of the wallet containing the NFTs to be transferred',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly from_address: string;

  @ApiProperty({
    title: "NFT receiver's wallet address",
    type: String,
    description: 'Address of the wallet to which the NFT will be transfered',
    example: 'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R',
  })
  @IsNotEmpty()
  @IsString()
  readonly to_address: string;
}
