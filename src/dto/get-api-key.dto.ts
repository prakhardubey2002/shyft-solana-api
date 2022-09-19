import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, Length, MaxLength } from 'class-validator';

export class GetApiKeyDto {
  @ApiProperty({
    title: 'name',
    description: 'Your name',
    example: 'John Doe',
  })
  @IsOptional()
  @Length(3, 30)
  readonly name?: string;

  @ApiProperty({
    title: 'email',
    description: 'Your Email ID',
    example: 'john.doe@company.in',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    title: 'project_name',
    description: 'Your project name',
    example: 'ABC Project',
  })
  @IsOptional()
  @Length(3, 30)
  readonly project_name?: string;

  @ApiProperty({
    title: 'team_size',
    description: 'Your team size',
    example: '20 - 50',
  })
  @IsOptional()
  @Length(6, 10)
  readonly team_size?: string;

  @ApiProperty({
    title: 'project_info',
    description: 'Your project info',
    example: 'Write something about your project',
  })
  @IsOptional()
  @MaxLength(255)
  readonly project_info?: string;
}
