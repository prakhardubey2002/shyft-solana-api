import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ApiProperty } from "@nestjs/swagger";

export class BuyAttachedDto {
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
		description: 'Buyer wallet\'s private key',
		example: '5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v',
	})
	@IsNotEmpty()
	@IsString()
	readonly private_key: string;

	@ApiProperty({
		title: 'Seller\'s Wallet Address',
		type: String,
		description: 'address of the seller wallet, who has listed the NFT for sale',
		example: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
	})
	@IsNotEmpty()
	@IsString()
	readonly seller_address: string;

	@ApiProperty({
		title: 'Marketplace Address',
		type: String,
		description: 'address of the Marketplace in which NFT is being sold',
		example: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
	})
	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

	@ApiProperty({
		title: 'Sale Price',
		type: Number,
		description: 'Amount that has to be paid by buyer to purchase the NFT',
		example: 10,
	})
	@IsNotEmpty()
	@IsNumber()
	readonly price: number;

	@ApiProperty({
		title: 'Address of the NFT',
		type: String,
		description: 'address of the NFT to be purchased',
		example: 'GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz',
	})
	@IsNotEmpty()
	@IsString()
	readonly nft_address: string;
}

export class BuyDto {
	@ApiProperty({
		title: 'network',
		type: String,
		enum: WalletAdapterNetwork,
		description: 'Select solana blockchain environment',
	})
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@ApiProperty({
		title: 'Buyer\'s Wallet Address',
		type: String,
		description: 'address of the buyer wallet which pays for the NFT sale',
		example: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
	})
	@IsNotEmpty()
	@IsString()
	readonly buyer_wallet: string;

	@ApiProperty({
		title: 'Seller\'s Wallet Address',
		type: String,
		description: 'address of the seller wallet, who has listed the NFT for sale',
		example: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
	})
	@IsNotEmpty()
	@IsString()
	readonly seller_address: string;

	@ApiProperty({
		title: 'Marketplace Address',
		type: String,
		description: 'address of the Marketplace in which NFT is being sold',
		example: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
	})
	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

	@ApiProperty({
		title: 'Sale Price',
		type: Number,
		description: 'Amount that has to be paid by buyer to purchase the NFT',
		example: 10,
	})
	@IsNotEmpty()
	@IsNumber()
	readonly price: number;

	@ApiProperty({
		title: 'Address of the NFT',
		type: String,
		description: 'address of the NFT to be purchased',
		example: 'GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz',
	})
	@IsNotEmpty()
	@IsString()
	readonly nft_address: string;
}