import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Network } from 'src/dto/netwotk.dto';

export class BurnNftDto {
  @IsNotEmpty()
  readonly network: Network;
  @IsNotEmpty()
  @IsString()
  readonly private_key: string;
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;
  @IsBoolean()
  @IsOptional()
  readonly close: boolean;
  @IsNumber()
  @IsOptional()
  readonly amount: number;
}
