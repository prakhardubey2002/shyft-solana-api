import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Network } from '../../../dto/netwotk.dto';

export class SendSolDto {
  @IsNotEmpty()
  readonly network: Network;
  @IsNotEmpty()
  @IsString()
  readonly from_private_key: string;
  @IsNotEmpty()
  @IsString()
  readonly to_address: string;
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;
}
