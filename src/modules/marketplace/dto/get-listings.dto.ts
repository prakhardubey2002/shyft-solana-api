import { IsNotEmpty } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class GetListingsDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;
	@IsNotEmpty()
	readonly marketplace_address: string;
}