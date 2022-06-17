import { ParseBoolPipe } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Network } from 'src/dto/netwotk.dto';

export class UpdateNftDto {
  @IsNotEmpty()
  readonly network: Network;
  @IsNotEmpty()
  @IsString()
  readonly privateKey: string;
  @IsNotEmpty()
  @IsString()
  readonly tokenAddress: string;
  @IsNotEmpty()
  @IsString()
  readonly updateAuthority: string;
  @IsNotEmpty()
  @IsString()
  readonly name: string;
  @IsNotEmpty()
  @IsString()
  readonly symbol: string;
  @IsNotEmpty()
  @IsString()
  readonly description: string;
  @IsNotEmpty()
  @Transform(({ value }) => JSON.parse(value), { toClassOnly: true })
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  readonly share: number;
  @IsNotEmpty()
  @IsString()
  readonly externalUrl: string;
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => {return (value === false ||value === 0) ? false : true }, { toClassOnly: true })
  readonly isMutable: boolean;
  @IsOptional()
  @IsBoolean()
  readonly primarySaleHappened: boolean;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  readonly sellerFeeBasisPoints: number;
}
