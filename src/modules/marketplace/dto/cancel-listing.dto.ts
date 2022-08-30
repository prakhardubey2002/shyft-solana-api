import { IsNotEmpty, IsString } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ApiProperty } from "@nestjs/swagger";

export class UnlistAttachedDto {
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
		title: 'List State Address',
		type: String,
		description: 'listing state address, received at the time of list creation',
		example: '3S8nfVMFhewv8jdy54xqxMt2GekpCDFVF3zkWAF2EThf',
	})
	@IsNotEmpty()
	@IsString()
	readonly list_state: string;

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

export class UnlistDto {
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
		title: 'List State Address',
		type: String,
		description: 'listing state address, received at the time of list creation',
		example: '3S8nfVMFhewv8jdy54xqxMt2GekpCDFVF3zkWAF2EThf',
	})
	@IsNotEmpty()
	@IsString()
	readonly list_state: string;

	@ApiProperty({
		title: 'Seller\'s Wallet Address',
		type: String,
		description: 'address of the seller wallet which has created the listing',
		example: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
	})
	@IsNotEmpty()
	@IsString()
	readonly seller_wallet: string;
}