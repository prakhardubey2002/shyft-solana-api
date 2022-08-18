import { IsNotEmpty } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class CreateListingDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;
	@IsNotEmpty()
	readonly marketplace_address: string;
	@IsNotEmpty()
	readonly nft_address: string;
	@IsNotEmpty()
	readonly price: number;
	@IsNotEmpty()
	readonly private_key: string;
}