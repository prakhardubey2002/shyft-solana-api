import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetAllMintsDto {
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
    description: 'Candy Machine Address',
    example: 'H2oYLkXdkX38eQ6VTqs26KAWAvEpYEiCtLt4knEUJxpu',
  })
  @IsNotEmpty()
  @IsString()
  readonly address: string;
}

export class GetAllMintsInfoDto {
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
    description: 'Candy Machine Address',
    example: 'H2oYLkXdkX38eQ6VTqs26KAWAvEpYEiCtLt4knEUJxpu',
  })
  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @ApiPropertyOptional({
    title: 'page',
    type: Number,
    description: 'Page want to browse',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  readonly page: number;

  @ApiPropertyOptional({
    title: 'size',
    type: Number,
    description: 'How many nfts want to display',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  readonly size: number;
}
