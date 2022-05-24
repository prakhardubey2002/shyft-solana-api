import { IsNotEmpty, IsString } from 'class-validator';

import { Network } from 'src/dto/netwotk.dto';

export class BalanceCheckDto {
  @IsNotEmpty()
  readonly network: Network;
  @IsNotEmpty()
  @IsString()
  readonly privateKey: string;
}
