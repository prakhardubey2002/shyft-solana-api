import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Transform } from 'class-transformer';

export class BalanceCheckDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'address',
    type: String,
    description: 'Wallet address',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly wallet: string;
}

export class TransactionHistoryDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'address',
    type: String,
    description: 'Wallet address',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly wallet: string;

  @ApiPropertyOptional({
    title: 'number of transaction',
    type: Number,
    description: 'By default: the value is 10',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  readonly tx_num: number;

  @ApiPropertyOptional({
    title: 'Before tx signature',
    type: String,
    description: 'Tx signature before which X number of transactions will be fetched, in reverse order going back in time',
    example: 'g9utkFojt6wtXsmLUhw5a17AJpjZo157Hzzq1Aqe771QwpPBzw1v4LSEus3MJibSJx8VzR2CfaiWbR2ueHFTr9e',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly before_tx_signature: string;
}

export class ResolveAddressDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select solana blockchain environment',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'address',
    type: String,
    description: 'Wallet address',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  readonly address: string;
}
