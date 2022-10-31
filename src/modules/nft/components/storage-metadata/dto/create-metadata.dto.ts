import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Creator, PublicKeyString } from '@metaplex-foundation/js';

export class NftFile {
  constructor(uri: string, type: string) {
    this.uri = uri;
    this.type = type;
  }
  uri: string;
  type: string;
}

export type CreatorDto = {
  address: PublicKeyString;
  verified: boolean;
  share: number;
};

export class CreateMetadataDto {
  @ApiProperty({
    title: 'network',
    type: String,
    enum: WalletAdapterNetwork,
    description: 'Select network',
  })
  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;

  @ApiProperty({
    title: 'creator',
    type: String,
    description: "Creator's Wallet Address",
    example: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
  })
  @IsNotEmpty()
  @IsString()
  readonly creator: string;

  @ApiProperty({
    title: 'image',
    type: String,
    description: 'NFT image URL',
    example: 'https://ipfs.io/ipfs/bafkreigx7c3s267vty55xutwjkdmllugvwu2mhoowlcvx2nnhjl6k5kjaq',
  })
  @IsNotEmpty()
  @IsString()
  readonly image: string;

  @ApiProperty({
    title: 'name',
    type: String,
    description: 'NFT name',
    example: 'Fish Eye',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    title: 'description',
    type: String,
    description: 'NFT symbol',
    example: 'FYE',
  })
  @IsNotEmpty()
  @IsString()
  readonly symbol: string;

  @ApiProperty({
    title: 'description',
    type: String,
    description: 'NFT description',
    example: 'Girl with beautiful eyes',
  })
  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @ApiProperty({
    title: 'attributes',
    type: Array,
    description: 'NFT attributes',
    example: [{ trait_type: 'edification', value: '100' }],
  })
  @IsNotEmpty()
  attributes: {
    trait_type: string;
    value: string | number;
  }[];

  @ApiProperty({
    title: 'share',
    type: Number,
    description: 'NFT share',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  readonly share: number;

  @ApiPropertyOptional({
    title: 'external_url',
    type: String,
    description: 'NFT external URL',
    example: 'https://www.example.com',
  })
  @IsOptional()
  @IsString()
  readonly external_url: string;

  @ApiPropertyOptional({
    title: 'seller_fee_basis_points',
    type: Number,
    description: 'NFT seller_fee_basis_points',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  readonly royalty: number;
  @ApiPropertyOptional({
    title: 'another file',
    type: new Object(),
    description: 'Attach another file',
    example: {
      uri: 'https://www.arweave.net/efgh1234?ext=mp4',
      type: 'video/mp4',
    },
  })
  @IsOptional()
  readonly file?: NftFile[];
}

export class CreateMetadataV2Dto {
  network: WalletAdapterNetwork;
  creators: Creator[];
  image: string;
  name: string;
  symbol: string;
  description: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  externalUrl: string;
  royalty: number;
  file?: NftFile[];

  private getJsonableCreators(): CreatorDto[] {
    const creators = this.creators.map((c) => {
      return {
        address: c.address.toBase58(),
        verified: c.verified,
        share: c.share,
      };
    });
    return creators;
  }

  public getMetaDataString(): string {
    const metadata = {
      name: this.name,
      symbol: this.symbol,
      description: this.description,
      seller_fee_basis_points: this.royalty ? this.royalty : 0,
      external_url: this.externalUrl ? this.externalUrl : '',
      image: this.image,
      attributes: this.attributes,
      properties: {
        creators: this.getJsonableCreators(),
      },
    };

    if (this.file) metadata.properties['files'] = this.file; // add files key to metadata obj
    const metadataSting = JSON.stringify(metadata);
    return metadataSting;
  }
}
