import { IsNotEmpty } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class GetPurchasesDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;
	@IsNotEmpty()
	readonly marketplace_address: string;
	@IsNotEmpty()
	readonly buyer_address: string;
}