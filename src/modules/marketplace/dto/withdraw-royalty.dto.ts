import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class WithdrawFeeDto {
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;

	@IsNotEmpty()
	@IsString()
	readonly marketplace_address: string;

	@IsNotEmpty()
	@IsNumber()
	readonly amount: number;

	@IsNotEmpty()
	@IsString()
	readonly private_key: string;
}
