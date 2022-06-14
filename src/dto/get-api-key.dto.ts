import { IsEmail } from 'class-validator';

export class GetApiKeyDto {
  @IsEmail()
  readonly email: string;
}
