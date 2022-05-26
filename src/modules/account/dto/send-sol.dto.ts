import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Network } from '../../../dto/netwotk.dto';

export class SendSolDto {
  @IsNotEmpty()
  readonly network: Network;
  @IsNotEmpty()
  @IsString()
  readonly privateKey: string;
  @IsNotEmpty()
  @IsString()
  readonly recipientPublicKey: string;
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;
}
