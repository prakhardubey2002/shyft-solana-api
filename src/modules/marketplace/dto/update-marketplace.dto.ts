import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max } from 'class-validator';

export class UpdateMarketplaceDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@IsNotEmpty()
	@IsString()
	readonly private_key: string;

	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

	@IsOptional()
	@IsString()
	readonly new_authority_address: string;

	@IsOptional()
	@IsNumber()
	@Max(100)
	@IsPositive()
	readonly new_marketplace_fee: number;

	@IsOptional()
	@IsString()
	readonly new_fee_payer: string;

	@IsOptional()
	@IsString()
	readonly new_fee_receipient: string;
}