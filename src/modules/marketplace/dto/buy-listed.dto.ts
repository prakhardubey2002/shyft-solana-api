import { IsNotEmpty } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class BuyDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;
	@IsNotEmpty()
	readonly private_key: string;
	@IsNotEmpty()
	readonly seller_address: string;
	@IsNotEmpty()
	readonly marketplace_address: string;
	@IsNotEmpty()
	readonly price: number;
	@IsNotEmpty()
	readonly nft_address: string;
}