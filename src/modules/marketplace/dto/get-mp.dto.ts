import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { IsNotEmpty } from 'class-validator';

export class GetMarketplacesDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;
}