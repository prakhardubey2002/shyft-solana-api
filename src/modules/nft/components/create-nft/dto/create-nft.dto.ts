import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Network } from 'src/dto/netwotk.dto';

export class CreateNftDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: Network,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: Network;

  @ApiProperty({
    title: 'private_key',
    type: String,
    description: 'YOUR_WALLET_PRIVATE_KEY',
    example:
      '5GGZQpoiDPRJLwMonq4ovBBKbxvNq76L3zgMXyiQ5grbPzgF3k35dkHuWwt3GmwVGZBXywXteJcJ53Emsda92D5v',
  })
  @IsNotEmpty()
  @IsString()
  readonly private_key: string;

  @ApiProperty({
    title: 'metadata_uri',
    type: String,
    description: 'NFT metadata_uri',
    example:
      'https://ipfs.io/ipfs/bafkreigx7c3s267vty55xutwjkdmllugvwu2mhoowlcvx2nnhjl6k5kjaq',
  })
  @IsNotEmpty()
  @IsString()
  readonly metadata_uri: string;
}
