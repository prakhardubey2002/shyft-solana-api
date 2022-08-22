import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class CreateListingDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

	@IsNotEmpty()
	@IsString()
	readonly nft_address: string;

	@IsNotEmpty()
	@IsNumber()
	readonly price: number;

	@IsNotEmpty()
	@IsString()
	readonly private_key: string;
}