import { IsNotEmpty, IsString } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class CancelListingDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

	@IsNotEmpty()
	@IsString()
	readonly list_state: string;

	@IsNotEmpty()
	@IsString()
	readonly private_key: string;
}