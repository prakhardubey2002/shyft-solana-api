import { IsNotEmpty, IsString } from 'class-validator';
import { Network } from 'src/dto/netwotk.dto';

export class BurnNftDto {
  @IsNotEmpty()
  readonly network: Network;
  @IsNotEmpty()
  @IsString()
  readonly privateKey: string;
  @IsNotEmpty()
  @IsString()
  readonly tokenAddress: string;
}
