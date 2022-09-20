import { IsNotEmpty, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ApiProperty } from '@nestjs/swagger';

export class GetListingDetailsDto {
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
    title: 'List State Address',
    type: String,
    description: 'listing state address, received at the time of list creation',
    example: '3S8nfVMFhewv8jdy54xqxMt2GekpCDFVF3zkWAF2EThf',
  })
  @IsNotEmpty()
  @IsString()
  readonly list_state: string;
}
