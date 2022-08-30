import { IsNotEmpty, IsString } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ApiProperty } from "@nestjs/swagger";

export class GetSellerListingsDto {
	@ApiProperty({
		title: 'network',
		type: String,
		enum: WalletAdapterNetwork,
		description: 'Select solana blockchain environment',
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
		title: 'Seller\'s Wallet Address',
		type: String,
		description: 'address of the seller, whoes listings has to be fetched',
		example: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
	})
	@IsNotEmpty()
	@IsString()
	readonly seller_address: string;
}