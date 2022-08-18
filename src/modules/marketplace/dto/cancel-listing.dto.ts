import { IsNotEmpty } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class CancelListingDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;
	@IsNotEmpty()
	readonly marketplace_address: string;
	@IsNotEmpty()
	readonly list_state: string;
	@IsNotEmpty()
	readonly private_key: string;
}