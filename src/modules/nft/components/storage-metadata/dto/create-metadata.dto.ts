import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Network } from 'src/dto/netwotk.dto';

export class CreateMetadataDto {
  @IsNotEmpty()
  readonly network: Network;
  @IsNotEmpty()
  @IsString()
  readonly private_key: string;
  @IsNotEmpty()
  @IsString()
  readonly image: string;
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
  attributes: {
    trait_type: string;
    value: string;
  }[];
  @IsNotEmpty()
  @IsNumber()
  readonly share: number;
  @IsOptional()
  @IsString()
  readonly external_url: string;
  @IsOptional()
  @IsNumber()
  readonly seller_fee_basis_points: number;
}
