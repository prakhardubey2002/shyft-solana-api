import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Transform } from 'class-transformer';
import { ServiceCharge } from 'src/common/utils/utils';

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
    description: 'Transfers update_authority to the receiver. False by default',
    example: 'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value ?? false;
  })
  readonly transfer_authority: boolean;
}

export class PrintNftEditionDetachDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'Address of wallet containing the NFT',
    type: String,
    description: 'Address of the wallet containing the Master Edition NFT',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly wallet: string;

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
    description: 'Transfers update_authority to the receiver. False by default.',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value ?? false;
  })
  readonly transfer_authority: boolean;

  @ApiPropertyOptional({
    title: 'Transaction Message',
    type: String,
    description: 'can add a message making use of the memo program',
    example: 'Thank you',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly message?: string;

  @ApiPropertyOptional({
    name: 'service_charge',
    description: 'You can charge some token/sol for minting nft',
    type: 'string',
    example: {
      receiver: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
      token: 'DjMA5cCK95X333t7SgkpsG5vC9wMk7u9JV4w8qipvFE8',
      amount: 0.01,
    },
  })
  @IsOptional()
  service_charge?: ServiceCharge;
}
