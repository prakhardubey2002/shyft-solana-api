import { IsNotEmpty, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ApiProperty } from '@nestjs/swagger';

export class GetPurchasesDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'Marketplace Address',
    type: String,
    description: 'address of the Marketplace in which the NFT is being sold',
    example: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
  })
  @IsNotEmpty()
  @IsString()
  readonly marketplace_address: string;

  @ApiProperty({
    title: "Buyer's Wallet Address",
    type: String,
    description: 'address of the buyer whose order history needs to be fetched',
    example: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
  })
  @IsNotEmpty()
  @IsString()
  readonly buyer_address: string;
}
