import { ApiProperty } from '@nestjs/swagger';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { IsNotEmpty } from 'class-validator';

export class GetMarketplacesDto {
	@ApiProperty({
		title: 'network',
		type: String,
		enum: WalletAdapterNetwork,
		description: 'Select network',
	})
	@IsNotEmpty()
	readonly network: WalletAdapterNetwork;
}