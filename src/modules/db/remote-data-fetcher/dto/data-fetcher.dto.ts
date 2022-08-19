import { MetadataData } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

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
  constructor(network: WalletAdapterNetwork, creator_wallet_address: string) {
    this.network = network;
    this.creator = creator_wallet_address;
  }

  @IsNotEmpty()
  readonly network: WalletAdapterNetwork;
  @IsNotEmpty()
  @IsString()
  readonly creator: string;
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
  onChainMetadata: MetadataData;
  offChainMetadata: any;
  owner: string;

  constructor(onChainData: MetadataData, offChainData: any, owner?: string) {
    this.onChainMetadata = onChainData;
    this.offChainMetadata = offChainData;
    this.owner = owner;
  }

  public getNftDbResponse(): NftDbResponse {
    const nftDbResponse = {
      name: this.onChainMetadata?.data?.name,
      symbol: this.onChainMetadata?.data?.symbol,
      royalty: this.onChainMetadata?.data?.sellerFeeBasisPoints / 100, //Since onchain 500 = 5%
      image_uri: this.offChainMetadata?.image,
      description: this.offChainMetadata?.description,
      update_authority: this.onChainMetadata?.updateAuthority,
      attributes: {},
      mint: this.onChainMetadata?.mint,
      owner: this.owner,
    };
    if (Array.isArray(this.offChainMetadata?.attributes)) {
      this.offChainMetadata?.attributes?.map((trait: any) => {
        nftDbResponse.attributes[trait?.trait_type] = trait?.value;
      });
    }

    return nftDbResponse;
  }

  public getNftInfoDto(): NftInfo {
    const nftDbDto = new NftInfo();
    nftDbDto.update_authority = this.onChainMetadata.updateAuthority;
    nftDbDto.mint = this.onChainMetadata.mint;
    nftDbDto.owner = this.owner;
    nftDbDto.primary_sale_happened = this.onChainMetadata.primarySaleHappened;
    nftDbDto.is_mutable = this.onChainMetadata.isMutable;
    nftDbDto.name = this.onChainMetadata.data.name;
    nftDbDto.symbol = this.onChainMetadata.data.symbol;
    nftDbDto.royalty = this.onChainMetadata.data.sellerFeeBasisPoints ?? 0; //Here we send the actual value back
    nftDbDto.metadata_uri = this.onChainMetadata.data.uri ?? '';
    nftDbDto.creators = this.onChainMetadata.data?.creators?.map((cr) => {
      return {
        address: cr.address,
        share: cr.share,
        verified: cr.verified,
      };
    });
    nftDbDto.image_uri = this.offChainMetadata?.image ?? '';
    nftDbDto.description = this.offChainMetadata?.description ?? '';
    nftDbDto.external_url = this.offChainMetadata?.external_url ?? '';
    nftDbDto.attributes = {};
    if (Array.isArray(this.offChainMetadata?.attributes)) {
      this.offChainMetadata?.attributes?.map((trait) => {
        nftDbDto.attributes[trait?.trait_type] = trait?.value;
      });
    }
    return nftDbDto;
  }
}
