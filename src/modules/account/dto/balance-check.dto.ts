import { IsNotEmpty, IsString } from 'class-validator';

import { Network } from '../../../dto/netwotk.dto';

export class BalanceCheckDto {
  @IsNotEmpty()
  readonly network: Network;
  @IsNotEmpty()
  @IsString()
  readonly address: string;
}
