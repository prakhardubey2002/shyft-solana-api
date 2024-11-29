import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class SignTransactionDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'private_keys',
    type: Array,
    description: 'array private keys to sign this transaction',
    example: ['5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v'],
  })
  @IsNotEmpty()
  @IsArray()
  readonly private_keys: string[];

  @ApiProperty({
    title: 'encoded_transaction',
    type: String,
    description: 'Transaction needed to sign',
    example:
      '5eG1aSjNoPmScw84G1d7f9n2fgmWabtQEgRjTUXvpTrRH1qduEMwUvUFYiS8px22JNedkWFTUWj9PrRyq1MyessunKC8Mjyq3hH5WZkM15D3gsooH8hsFegyYRBmccLBTEnPph6fExEySkJwsfH6oGC62VmDDCpWyPHZLYv52e4qtUb1TBE6SgXE6FX3TFqrX5HApSkb9ZaCSz21FyyEbXtrmMxBQE1CR7BTyadWL1Vy9SLfo9tnsVpHHDHthFRr',
  })
  @IsNotEmpty()
  @IsString()
  readonly encoded_transaction: string;
}

export class SignAllTransactionsDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'private_keys',
    type: Array,
    description: 'array private keys to sign this transaction',
    example: ['5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v'],
  })
  @IsNotEmpty()
  @IsArray()
  readonly private_keys: string[];

  @ApiProperty({
    title: 'encoded_transactions',
    type: Array,
    description: 'Transactions needed to sign',
    example: [
      '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',
    ],
  })
  @IsNotEmpty()
  @IsArray()
  readonly encoded_transactions: string[];
}
