import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Metadata } from '@metaplex-foundation/js';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { NftFile } from 'src/modules/nft/components/storage-metadata/dto/create-metadata.dto';

//update attributes value type to hold objects also
export interface NftDbResponse {
  name: string;
  description: string;
  symbol: string;
  image_uri: string;
  royalty: number;
  mint: string;
  attributes: { [k: string]: string | number };
  owner: string;
  update_authority: string;
}

export class FetchAllNftDto {
  constructor(network: WalletAdapterNetwork, address: string, updateAuthority?: string) {
    this.network = network;
    this.walletAddress = address;
    this.updateAuthority = updateAuthority;
  }

  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;
  @IsNotEmpty()
  @IsString()
  readonly walletAddress: string;

  @IsOptional()
  @IsString()
  readonly updateAuthority: string;
}

export class FetchAllNftByCreatorDto {
  constructor(network: WalletAdapterNetwork, creator_address: string, page?: number, size?: number) {
    this.network = network;
    this.creator = creator_address;
    this.page = page;
    this.size = size;
  }

  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;
  @IsNotEmpty()
  @IsString()
  readonly creator: string;

  @ApiPropertyOptional({
    title: 'page',
    type: Number,
    description: 'Page',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  readonly page?: number;

  @ApiPropertyOptional({
    title: 'size',
    type: Number,
    description: 'How many content on a page',
    example: 10,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Max(50)
  @Transform(({ value }) => {
    return parseInt(value);
  })
  readonly size?: number;
}

export class FetchNftDto {
  constructor(network: WalletAdapterNetwork, address: string) {
    this.network = network;
    this.tokenAddress = address;
  }

  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;
  @IsNotEmpty()
  @IsString()
  readonly tokenAddress: string;
}

export class NftData {
  onChainMetadata: Metadata;
  offChainMetadata: any;
  owner: string;

  constructor(onChainData: Metadata, offChainData: any, owner?: string) {
    this.onChainMetadata = onChainData;
    this.offChainMetadata = offChainData;
    this.owner = owner;
  }

  //For API response
  public getNftDbResponse(): NftDbResponse {
    const nftDbResponse = {
      name: this.onChainMetadata?.name,
      symbol: this.onChainMetadata?.symbol,
      royalty: this.onChainMetadata?.sellerFeeBasisPoints / 100, //Since onchain 500 = 5%
      image_uri: this.offChainMetadata?.image ?? '',
      cached_image_uri: this.offChainMetadata?.image ?? '',
      metadata_uri: this.onChainMetadata?.uri ?? '',
      description: this.offChainMetadata?.description ?? '',
      update_authority: this.onChainMetadata?.updateAuthorityAddress.toBase58(),
      attributes: {},
      attributes_array: [],
      external_url: this.offChainMetadata?.external_url ?? '',
      files: this.offChainMetadata?.properties?.files,
      mint: this.onChainMetadata?.mintAddress.toBase58(),
      owner: this.owner,
      creators: this.onChainMetadata?.creators,
      collection: this.onChainMetadata?.collection
        ? {
            address: this.onChainMetadata?.collection?.address,
            verified: this.onChainMetadata?.collection?.verified,
          }
        : {},
    };
    if (Array.isArray(this.offChainMetadata?.attributes)) {
      this.offChainMetadata?.attributes?.map((trait: any) => {
        if (trait?.trait_type && trait?.value) {
          nftDbResponse.attributes[trait?.trait_type] = trait?.value;
          nftDbResponse.attributes_array.push({
            trait_type: trait?.trait_type,
            value: trait?.value,
          });
        }
      });
    }

    return nftDbResponse;
  }

  //Convert to a format which can be saved in DB
  public getNftInfoDto(): NftInfo {
    const nftDbDto = new NftInfo();
    nftDbDto.update_authority = this.onChainMetadata.updateAuthorityAddress.toBase58();
    nftDbDto.mint = this.onChainMetadata.mintAddress.toBase58();
    nftDbDto.owner = this.owner;
    nftDbDto.primary_sale_happened = this.onChainMetadata.primarySaleHappened;
    nftDbDto.is_mutable = this.onChainMetadata.isMutable;
    nftDbDto.name = this.onChainMetadata.name;
    nftDbDto.symbol = this.onChainMetadata.symbol;
    nftDbDto.royalty = this.onChainMetadata.sellerFeeBasisPoints ?? 0; //Here we send the actual value back
    nftDbDto.metadata_uri = this.onChainMetadata.uri ?? '';
    nftDbDto.creators = this.onChainMetadata?.creators?.map((cr) => {
      return {
        address: cr.address.toBase58(),
        share: cr.share,
        verified: cr.verified,
      };
    });
    nftDbDto.collection_data = {
      address: this.onChainMetadata?.collection?.address.toBase58(),
      verified: this.onChainMetadata?.collection?.verified,
    };
    //Only add these keys, if we have valid values
    this.offChainMetadata?.image ? (nftDbDto.image_uri = this.offChainMetadata?.image) : {};

    this.offChainMetadata?.description ? (nftDbDto.description = this.offChainMetadata?.description) : {};

    this.offChainMetadata?.external_url ? (nftDbDto.external_url = this.offChainMetadata?.external_url) : {};

    this.offChainMetadata?.properties?.files
      ? (nftDbDto.files = this.offChainMetadata?.properties?.files?.map((file: NftFile) => {
          return {
            uri: file?.uri,
            type: file?.type,
          };
        }))
      : {};

    if (Array.isArray(this.offChainMetadata?.attributes) && this.offChainMetadata?.attributes?.length > 0) {
      nftDbDto.attributes = {};

      this.offChainMetadata?.attributes?.map((trait) => {
        if (trait?.trait_type && trait?.value) {
          nftDbDto.attributes[trait?.trait_type] = trait?.value;
        }
      });
    }
    return nftDbDto;
  }
}
