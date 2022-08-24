import { IsNotEmpty, IsString } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class GetPurchasesDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

	@IsNotEmpty()
	@IsString()
	readonly buyer_address: string;
}