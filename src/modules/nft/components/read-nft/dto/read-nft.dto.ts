import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Transform } from 'class-transformer';

export class ReadNftDto {
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
    description: 'Token address',
    example: 'GE7sYdjDoxcqvsd7wzKf8tU2BWBzMDrD5j4eT45jDnJP',
  })
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;

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
