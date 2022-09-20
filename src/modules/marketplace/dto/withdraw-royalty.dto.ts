import { ApiProperty } from '@nestjs/swagger';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class WithdrawFeeAttachedDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'Marketplace Address',
    type: String,
    description: 'address of the Marketplace in which the NFT is being sold',
    example: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
  })
  @IsNotEmpty()
  @IsString()
  readonly marketplace_address: string;

  @ApiProperty({
    title: 'Amount to be withdrawn',
    type: Number,
    description:
      "amount of tokens to be withdrawn from the marketplace's treasury.",
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;

  @ApiProperty({
    title: 'private_key',
    type: String,
    description: "Marketplace authority wallet's private key",
    example:
      '5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v',
  })
  @IsNotEmpty()
  @IsString()
  readonly private_key: string;
}

export class WithdrawFeeDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'Marketplace Address',
    type: String,
    description: 'address of the Marketplace in which the NFT is being sold',
    example: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
  })
  @IsNotEmpty()
  @IsString()
  readonly marketplace_address: string;

  @ApiProperty({
    title: 'Amount to be withdrawn',
    type: Number,
    description:
      "amount of tokens to be withdrawn from the marketplace's treasury.",
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;

  @ApiProperty({
    title: 'Marketplace authority address',
    type: String,
    description: 'address of the current authority account of the marketplace',
    example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
  })
  @IsNotEmpty()
  @IsString()
  readonly authority_wallet: string;
}
