import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindMarketplaceDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@IsNotEmpty()
	@IsString()
	readonly creator_address: string;

	@IsNotEmpty()
	@IsString()
	readonly currency_address: string;
}