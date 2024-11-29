import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMarketPlaceAttachedDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'private_key',
    type: String,
    description: "Marketplace creator wallet's private key",
    example: '5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v',
  })
  @IsNotEmpty()
  @IsString()
  readonly private_key: string;

  @ApiPropertyOptional({
    title: "Marketplace's Authority address",
    type: String,
    description:
      'The account which has the permission to update the marketplace properties and execute a withdrawal from the marketplace treasury.',
    example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
    default: 'Marketplace creator is the default Authority.',
  })
  @IsOptional()
  @IsString()
  readonly authority_address: string;

  @ApiPropertyOptional({
    title: 'SPL currecy address',
    type: String,
    description: 'address of the spl token that will be used as the transaction currency in the marketplace.',
    example: '3S8nfVMFhewv8jdy54xqxMt2GekpCDFVF3zkWAF2EThf',
    default: 'So11111111111111111111111111111111111111112',
  })
  @IsOptional()
  @IsString()
  readonly currency_address: string;

  @ApiPropertyOptional({
    title: "Fee payer's address",
    type: String,
    description:
      'A wallet that is used to pay for Solana fees for the seller and buyer if the marketplace chooses to execute the sale in the background.',
    example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
  })
  @IsOptional()
  @IsString()
  readonly fee_payer: string;

  @ApiPropertyOptional({
    title: "Fee Receipient's address",
    type: String,
    description: 'address which will receive the transaction fee getting accumulated in the marketplace treasury',
    example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
  })
  @IsOptional()
  @IsString()
  readonly fee_recipient: string;

  @ApiPropertyOptional({
    title: 'Transaction fee percentage',
    type: Number,
    description:
      "percentage amount of every sale transaction's amount that will be deposited in the marketplace treasury.",
    example: 10,
    maximum: 100,
    default: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  @Max(100)
  @IsPositive()
  readonly transaction_fee: number;
}

export class CreateMarketPlaceDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: "Creator's wallet address",
    type: String,
    description: 'address of the creator of the marketplace',
    example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
  })
  @IsNotEmpty()
  @IsString()
  readonly creator_wallet: string;

  @ApiPropertyOptional({
    title: "Marketplace's Authority address",
    type: String,
    description:
      'The account which has the permission to update the marketplace properties and execute a withdrawal from the marketplace treasury.',
    example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
    default: 'Marketplace creator is the default Authority.',
  })
  @IsOptional()
  @IsString()
  readonly authority_address: string;

  @ApiPropertyOptional({
    title: 'SPL currecy address',
    type: String,
    description: 'address of the spl token that will be used as the transaction currency in the marketplace.',
    example: '3S8nfVMFhewv8jdy54xqxMt2GekpCDFVF3zkWAF2EThf',
    default: 'So11111111111111111111111111111111111111112',
  })
  @IsOptional()
  @IsString()
  readonly currency_address: string;

  @ApiPropertyOptional({
    title: "Fee payer's address",
    type: String,
    description:
      'A wallet that is used to pay for Solana fees for the seller and buyer if the marketplace chooses to execute the sale in the background.',
    example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
  })
  @IsOptional()
  @IsString()
  readonly fee_payer: string;

  @ApiPropertyOptional({
    title: "Fee Recipient's address",
    type: String,
    description: 'address which will receive the transaction fee getting accumulated in the marketplace treasury',
    example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
  })
  @IsOptional()
  @IsString()
  readonly fee_recipient: string;

  @ApiPropertyOptional({
    title: 'Transaction fee percentage',
    type: Number,
    description:
      "percentage amount of every sale transaction's amount that will be deposited in the marketplace treasury.",
    example: 10,
    maximum: 100,
    default: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  @Max(100)
  @IsPositive()
  readonly transaction_fee: number;
}
