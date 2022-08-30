import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ApiProperty } from "@nestjs/swagger";

export class ListAttachedDto {
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
		title: 'Address of the NFT',
		type: String,
		description: 'address of the NFT to be purchased',
		example: 'GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz',
	})
	@IsNotEmpty()
	@IsString()
	readonly nft_address: string;

	@ApiProperty({
		title: 'Sale Price',
		type: Number,
		description: 'Price at which this NFT will be sold',
		example: 10,
	})
	@IsNotEmpty()
	@IsNumber()
	readonly price: number;

	@ApiProperty({
		title: 'private_key',
		type: String,
		description: 'Seller wallet\'s private key',
		example: '5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v',
	})
	@IsNotEmpty()
	@IsString()
	readonly private_key: string;
}

export class ListDto {
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
		title: 'Address of the NFT',
		type: String,
		description: 'address of the NFT to be purchased',
		example: 'GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz',
	})
	@IsNotEmpty()
	@IsString()
	readonly nft_address: string;

	@ApiProperty({
		title: 'Sale Price',
		type: Number,
		description: 'Price at which this NFT will be sold',
		example: 10,
	})
	@IsNotEmpty()
	@IsNumber()
	readonly price: number;

	@ApiProperty({
		title: 'Seller\'s Wallet Address',
		type: String,
		description: 'address of the seller wallet',
		example: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
	})
	@IsNotEmpty()
	@IsString()
	readonly seller_wallet: string;
}