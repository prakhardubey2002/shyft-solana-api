import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max } from "class-validator";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

//naming convention update
export class CreateMarketPlaceDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@IsNotEmpty()
	@IsString()
	readonly private_key: string;

	@IsOptional()
	@IsString()
	readonly currency_address: string;

	@IsOptional()
	@IsString()
	readonly update_authority: string;

	@IsOptional()
	@IsString()
	readonly fee_payer: string;

	@IsOptional()
	@IsString()
	readonly fee_receipient: string;

	@IsNotEmpty()
	@IsNumber()
	@Max(100)
	@IsPositive()
	readonly transaction_fee: number;
}