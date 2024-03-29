import { ApiProperty } from '@nestjs/swagger';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindMarketplaceDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: "Markteplace's authority address",
    type: String,
    description: 'address of the marketplace authority',
    example: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
  })
  @IsNotEmpty()
  @IsString()
  readonly authority_address: string;

  @ApiProperty({
    title: 'SPL currecy dddress',
    type: String,
    description:
      'address of the spl token that is used as the transaction currency in the marketplace.',
    example: 'So11111111111111111111111111111111111111112',
  })
  @IsNotEmpty()
  @IsString()
  readonly currency_address: string;
}
