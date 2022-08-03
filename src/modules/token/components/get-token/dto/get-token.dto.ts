import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class GetTokenDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'mint_token',
    type: String,
    description: 'Mint Token',
    example: '2upV85cDWrDRagDkFH7xezbQPwgAaQQS6CyMHFKqrUnq',
  })
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;
}
