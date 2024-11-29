import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class Password {
  @ApiProperty({
    title: 'password',
    type: String,
    description: 'Enter a strong password',
    example: 'A1#hybtrcqqKkl',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}

export class VerifyDto {
  @ApiProperty({
    title: 'password',
    type: String,
    description: 'Enter a strong password',
    example: 'A1#hybtrcqqKkl',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    title: 'wallet_address',
    type: String,
    description: 'Your wallet address',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  wallet: string;
}

export class GetKeypairDto {
  @ApiProperty({
    title: 'wallet_address',
    type: String,
    description: 'Your wallet address',
    example: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
  })
  @IsNotEmpty()
  @IsString()
  wallet: string;
  @ApiProperty({
    title: 'password',
    type: String,
    description: 'Enter a strong password',
    example: 'A1#hybtrcqqKkl',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}