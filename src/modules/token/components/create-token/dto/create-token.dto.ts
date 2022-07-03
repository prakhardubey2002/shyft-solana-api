import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Network } from 'src/dto/netwotk.dto';

export class CreateTokenDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: Network,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: Network;

  @ApiProperty({
    title: 'private_key',
    type: String,
    description: 'YOUR_WALLET_PRIVATE_KEY',
    example: '5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v',
  })
  @IsNotEmpty()
  @IsString()
  private_key: string;

  @ApiProperty({
    title: 'name',
    type: String,
    description: 'Token name',
    example: 'Shyft',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    title: 'symbol',
    type: String,
    description: 'Token symbol',
    example: 'SHY',
  })
  @IsNotEmpty()
  @IsString()
  readonly symbol: string;

  @ApiProperty({
    title: 'description',
    type: String,
    description: 'Token description',
    example: 'This is a test token',
  })
  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @ApiProperty({
    title: 'share',
    type: Number,
    description: 'Token share on primary sale, between 0 - 100',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  readonly share: number;

  @ApiProperty({
    title: 'Royalty',
    type: Number,
    description: 'Token royalty on secondary sales, between 0 - 100',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  readonly royalty: number;

  @ApiProperty({
    name: 'file',
    description: 'Token image to be uploaded',
    type: 'string',
    format: 'binary',
  })
  file: string;

  @ApiProperty({
    title: 'Decimals',
    type: Number,
    description: 'Number of base-10 digits to the right of the decimal place',
    example: 9,
  })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  readonly decimals: number;
}
