import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Network } from 'src/dto/netwotk.dto';

export class ReadNftDto {
  @IsNotEmpty()
  readonly network: Network;
  @IsOptional()
  readonly privateKey: string;
  @IsOptional()
  readonly publicKey: string;
}
