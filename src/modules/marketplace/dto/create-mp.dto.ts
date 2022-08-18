import { IsNotEmpty, IsOptional } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

//naming convention update
export class CreateMarketPlaceDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;
	@IsNotEmpty()
	readonly private_key: string;
	@IsOptional()
	readonly marketplace_currency: string;
	@IsOptional()
	readonly update_authority: string;
	@IsOptional()
	readonly fee_payer: string;
	@IsOptional()
	readonly royalty_withdraw_owner: string;
	@IsNotEmpty()
	readonly marketplace_royalty: number;
}