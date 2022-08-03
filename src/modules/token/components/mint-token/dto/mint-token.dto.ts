import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class MintTokenDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'address',
    type: String,
    description: 'YOUR_WALLET_ADDRESS',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @ApiProperty({
    title: 'mint_token',
    type: String,
    description: 'Mint Token',
    example: '2upV85cDWrDRagDkFH7xezbQPwgAaQQS6CyMHFKqrUnq',
  })
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;

  @ApiProperty({
    title: 'amount',
    type: Number,
    description: 'How many tokens do you want to mint?',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;
}
