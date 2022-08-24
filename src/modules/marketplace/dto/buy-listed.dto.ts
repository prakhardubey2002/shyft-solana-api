import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class BuyDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@IsNotEmpty()
	@IsString()
	readonly private_key: string;

	@IsNotEmpty()
	@IsString()
	readonly seller_address: string;

	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

	@IsNotEmpty()
	@IsNumber()
	readonly price: number;

	@IsNotEmpty()
	@IsString()
	readonly nft_address: string;
}