import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { isEmpty } from 'lodash';
import { PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Metadata } from '@metaplex-foundation/js';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { NftFile } from 'src/modules/nft/components/storage-metadata/dto/create-metadata.dto';
import { NftApiResponse } from '../../../nft/nft-response-dto';

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

export class FetchNftsByMintListDto {
  constructor(network: WalletAdapterNetwork, addresses: PublicKey[]) {
    this.network = network;
    this.addresses = addresses;
  }

  readonly network: WalletAdapterNetwork;
  readonly addresses: PublicKey[];
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
  public getNftApiResponse(): NftApiResponse {
    const nftApiResponse: NftApiResponse = {
      name: this.onChainMetadata?.name,
      symbol: this.onChainMetadata?.symbol,
      royalty: this.onChainMetadata?.sellerFeeBasisPoints / 100, //Since onchain 500 = 5%
      image_uri: this.offChainMetadata?.image ?? '',
      cached_image_uri: this.offChainMetadata?.image ?? '',
      metadata_uri: this.onChainMetadata?.uri ?? '',
      description: this.offChainMetadata?.description ?? '',
      mint: this.onChainMetadata?.mintAddress.toBase58(),
      owner: this.owner,
      update_authority: this.onChainMetadata?.updateAuthorityAddress.toBase58(),
      creators: this.onChainMetadata?.creators,
      collection: {},
      attributes: {},
      attributes_array: [],
      files: this.offChainMetadata?.properties?.files,
      external_url: this.offChainMetadata?.external_url ?? '',
      primary_sale_happened: this.onChainMetadata.primarySaleHappened,
      is_mutable: this.onChainMetadata.isMutable,
      is_loaded_metadata: this.offChainMetadata ? true : false,
    };
    nftApiResponse.collection = {
      address: this.onChainMetadata?.collection?.address,
      verified: this.onChainMetadata?.collection?.verified,
      name: this.offChainMetadata?.collection?.name,
      family: this.offChainMetadata?.collection?.family,
    };
    if (Array.isArray(this.offChainMetadata?.attributes)) {
      this.offChainMetadata?.attributes?.map((trait: any) => {
        if (trait?.trait_type && trait?.value) {
          nftApiResponse.attributes[trait?.trait_type] = trait?.value;
          nftApiResponse.attributes_array.push({
            trait_type: trait?.trait_type,
            value: trait?.value,
          });
        }
      });
    }

    return nftApiResponse;
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
    nftDbDto.is_loaded_metadata = isEmpty(this.offChainMetadata) ? false : true;
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
      name: this.offChainMetadata?.collection?.name,
      family: this.offChainMetadata?.collection?.family,
    };
    //Only add these keys, if we have valid values
    this.offChainMetadata?.image ? (nftDbDto.image_uri = this.offChainMetadata?.image) : {};

    this.offChainMetadata?.description ? (nftDbDto.description = this.offChainMetadata?.description) : {};

    this.offChainMetadata?.external_url ? (nftDbDto.external_url = this.offChainMetadata?.external_url) : {};

    if (this.offChainMetadata?.properties?.files) {
      try {
        this.offChainMetadata?.properties?.files
          ? (nftDbDto.files = this.offChainMetadata.properties.files.map((file: NftFile) => {
              return {
                uri: file?.uri,
                type: file?.type,
              };
            }))
          : {};
      } catch (err) {
        nftDbDto.files = {
          uri: this.offChainMetadata.properties.files?.uri,
          type: this.offChainMetadata.properties.files?.type,
        };
      }
    }

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
