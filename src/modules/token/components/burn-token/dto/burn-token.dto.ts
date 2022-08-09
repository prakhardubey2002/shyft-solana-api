import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class BurnTokenDto {
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
    example: '5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v',
  })
  @IsNotEmpty()
  @IsString()
  readonly private_key: string;

  @ApiProperty({
    title: 'token_address',
    type: String,
    description: 'Token address',
    example: 'HBE5dEcFHiJtU8vmTyx7MhB43nFRMJt8ddC8Lupc3Jph',
  })
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;

  @ApiProperty({
    title: 'amount',
    type: Number,
    description: 'How many tokens do you want to burn?',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;
}

export class BurnTokenDetachDto {
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
    title: 'token_address',
    type: String,
    description: 'Token address',
    example: 'HBE5dEcFHiJtU8vmTyx7MhB43nFRMJt8ddC8Lupc3Jph',
  })
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;

  @ApiProperty({
    title: 'amount',
    type: Number,
    description: 'How many tokens do you want to burn?',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;
}
