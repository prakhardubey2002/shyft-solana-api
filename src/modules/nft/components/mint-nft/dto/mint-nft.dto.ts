import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Transform } from 'class-transformer';

export class PrintNftEditionDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'Private key of wallet containing the NFT',
    type: String,
    description: 'Private Key of the wallet containing the Master Edition NFT',
    example: '5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v',
  })
  @IsNotEmpty()
  @IsString()
  readonly private_key: string;

  @ApiProperty({
    title: 'Master edition Address',
    type: String,
    description: 'Address of the Master Edition NFT',
    example: '37CGrKHKhCj42xSMeJ5HH2TfidjPWHVR994L8msVRzoC',
  })
  @IsNotEmpty()
  @IsString()
  readonly master_nft_address: string;

  @ApiPropertyOptional({
    title: 'New Owner',
    type: String,
    description: 'Wallet address of the receiver, by default will be minted into whoever holds master edition',
    example: 'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R',
  })
  @IsString()
  @IsOptional()
  readonly receiver: string;

  @ApiPropertyOptional({
    title: 'Transfer Update Authority',
    type: Boolean,
    description: "If you want to keep 'update authority' yours, don't pass on any wallet address.",
    example: 'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value ?? false;
  })
  readonly transfer_authority: boolean;
}
