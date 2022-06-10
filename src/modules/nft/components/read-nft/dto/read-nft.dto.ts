import { IsNotEmpty, IsString } from 'class-validator';
import { Network } from 'src/dto/netwotk.dto';

export class ReadNftDto {
  @IsNotEmpty()
  readonly network: Network;
  @IsNotEmpty()
  @IsString()
  readonly token_address: string;
}
