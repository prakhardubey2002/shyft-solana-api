import { IsNotEmpty } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class GetSellerListingsDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;
	@IsNotEmpty()
	readonly marketplace_address: string;
	@IsNotEmpty()
	readonly seller_address: string;
}