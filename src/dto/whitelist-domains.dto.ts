import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { trim } from 'lodash';

export class WhiteListDomainsDto {
  @ApiProperty({
    title: 'api_key',
    description: 'api_key to add domains',
    example: 'Pi3dU50L4p5F087o',
  })
  @IsString()
  readonly api_key: string;

  @ApiProperty({
    title: 'domains',
    description:
      'A comma separated list of domins, that needs to be added to/removed from whitelisting',
    example: 'https://shyft.to, http://shyfter.to',
    type: String,
  })
  domains: string;

  //todo: update this implemenation with REGEX
  public getDomainList(): string[] {
    const splits = this.domains.split(',');
    const result: string[] = [];
    for (const st of splits) {
      const t = trim(st);
      if (t != '') result.push(t);
    }
    return result;
  }
}
