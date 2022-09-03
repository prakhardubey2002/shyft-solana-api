import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max } from 'class-validator';

export class UpdateMarketplaceAttachedDto {
	@ApiProperty({
		title: 'network',
		type: String,
		enum: WalletAdapterNetwork,
		description: 'Select solana blockchain environment',
	})
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@ApiProperty({
		title: 'private_key',
		type: String,
		description: 'marketplace authority\'s private key',
		example: '5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v',
	})
	@IsNotEmpty()
	@IsString()
	readonly private_key: string;

	@ApiProperty({
		title: 'Marketplace Address',
		type: String,
		description: 'address of the Marketplace in which the NFT is being sold',
		example: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
	})
	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

	@ApiPropertyOptional({
		title: 'New Update Authority Address',
		type: String,
		description: 'address of the Marketplace in which the NFT is being sold',
		example: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
	})
	@IsOptional()
	@IsString()
	readonly new_authority_address: string;

	@ApiPropertyOptional({
		title: 'New Transaction fee percentage',
		type: Number,
		description: 'percentage amount of every sale transaction\'s amount that will be deposited in the marketplace treasury.',
		example: 10,
		maximum: 100,
	})
	@IsOptional()
	@IsNumber()
	@Max(100)
	@IsPositive()
	readonly transaction_fee: number;

	@ApiPropertyOptional({
		title: 'New Fee payer\'s address',
		type: String,
		description: 'A wallet that is used to pay for Solana fees for the seller and buyer if the marketplace chooses to execute the sale in the background.',
		example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
	})
	@IsOptional()
	@IsString()
	readonly fee_payer: string;

	@ApiPropertyOptional({
		title: 'New Fee Recipient\'s address',
		type: String,
		description: 'address which will receive the transaction fee getting accumulated in the marketplace treasury',
		example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
	})
	@IsOptional()
	@IsString()
	readonly fee_recipient: string;
}

export class UpdateMarketplaceDto {
	@ApiProperty({
		title: 'network',
		type: String,
		enum: WalletAdapterNetwork,
		description: 'Select solana blockchain environment',
	})
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@ApiProperty({
		title: 'Marketplace\'s Authority address',
		type: String,
		description: 'address of the current authority account of the marketplace',
		example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
	})
	@IsNotEmpty()
	@IsString()
	readonly authority_wallet: string;

	@ApiProperty({
		title: 'Marketplace Address',
		type: String,
		description: 'address of the Marketplace in which the NFT is being sold',
		example: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
	})
	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

	@ApiPropertyOptional({
		title: 'New Update Authority Address',
		type: String,
		description: 'account address that will be the new update authority of the marketplace.',
		example: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
	})
	@IsOptional()
	@IsString()
	readonly new_authority_address: string;

	@ApiPropertyOptional({
		title: 'New Transaction fee percentage',
		type: Number,
		description: 'percentage amount of every sale transaction\'s amount that will be deposited in the marketplace treasury.',
		example: 10,
		maximum: 100,
	})
	@IsOptional()
	@IsNumber()
	@Max(100)
	@IsPositive()
	readonly transaction_fee: number;

	@ApiPropertyOptional({
		title: 'New Fee payer\'s address',
		type: String,
		description: 'A wallet that is used to pay for Solana fees for the seller and buyer if the marketplace chooses to execute the sale in the background.',
		example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
	})
	@IsOptional()
	@IsString()
	readonly fee_payer: string;

	@ApiPropertyOptional({
		title: 'New Fee Recipient\'s address',
		type: String,
		description: 'address which will receive the transaction fee getting accumulated in the marketplace treasury',
		example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
	})
	@IsOptional()
	@IsString()
	readonly fee_recipient: string;
}