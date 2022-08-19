import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class ReadAllNftDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'wallet_address',
    type: String,
    description: 'Your wallet address',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @ApiProperty({
    title: 'update_authority address. Filters only those nfts in your wallet which have this update_authority.',
    type: String,
    description: 'Update Authority, projects wallet address',
    example: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly update_authority: string;

  @ApiProperty({
    title: 'Refresh',
    type: String,
    description: 'Skip DB and fetch directly from blockchain. Only need to mention in query params, no value needed.',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly refresh: string;
}


export class ReadAllNftByCreatorDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'creator_wallet_address',
    type: String,
    description: 'Your wallet address',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly creator_wallet_address: string;

  @ApiProperty({
    title: 'Refresh',
    type: String,
    description: 'Skip DB and fetch directly from blockchain. Only need to mention in query params, no value needed.',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly refresh: string;
}
