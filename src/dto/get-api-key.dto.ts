import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class GetApiKeyDto {
  @ApiProperty({
    title: 'email',
    description: 'Your Email ID',
    example: 'john.doe@company.in',
  })
  @IsEmail()
  readonly email: string;
}
