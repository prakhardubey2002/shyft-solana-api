import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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
    title: 'private_key',
    type: String,
    description: 'YOUR_WALLET_PRIVATE_KEY',
    example: '5GGZQpoiDPRJLwMonq4ovBBKbxvKq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3RmwVGZBXywXteJcJ53Emsda92D5v',
  })
  @IsNotEmpty()
  @IsString()
  readonly private_key: string;

  @ApiProperty({
    title: 'receiver',
    type: String,
    description: 'Public Key of receiver',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly receiver: string;

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

  @ApiPropertyOptional({
    title: 'Transaction Message',
    type: String,
    description: 'can add a message making use of the memo program',
    example: 'Thank you',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly message?: string;
}

export class MintTokenDetachDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'wallet',
    type: String,
    description: 'YOUR_WALLET_ADDRESS',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly wallet: string;

  @ApiProperty({
    title: 'receiver',
    type: String,
    description: 'Public Key of receiver',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly receiver: string;

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

  @ApiPropertyOptional({
    title: 'Transaction Message',
    type: String,
    description: 'can add a message making use of the memo program',
    example: 'Thank you',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly message?: string;
}
