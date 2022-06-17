import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { IsNotEmpty, IsString } from 'class-validator';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { Network } from 'src/dto/netwotk.dto';

export class FetchAllNftDto {
    constructor(network: Network, address: string) {
        this.network = network
        this.walletAddress = address
    }

    @IsNotEmpty()
    readonly network: Network;
    @IsNotEmpty()
    @IsString()
    readonly walletAddress: string;
}


export class FetchNftDto {
    constructor(network: Network, address: string) {
        this.network = network
        this.tokenAddress = address
    }

    @IsNotEmpty()
    readonly network: Network;
    @IsNotEmpty()
    @IsString()
    readonly tokenAddress: string;
}

export class NftData {
    onChainMetadata: Metadata
    offChainMetadata: any

    constructor(onChainData: Metadata, offChainData: any) {
        this.onChainMetadata = onChainData
        this.offChainMetadata = offChainData
    }

    public getNftInfoDto(): NftInfo {
        let nftDbDto = new NftInfo()
        nftDbDto.updateAuthority = this.onChainMetadata.data.updateAuthority
        nftDbDto.mint = this.onChainMetadata.data.mint
        nftDbDto.primarySaleHappened = this.onChainMetadata.data.primarySaleHappened
        nftDbDto.isMutable = this.onChainMetadata.data.isMutable
        nftDbDto.name = this.onChainMetadata.data.data.name
        nftDbDto.symbol = this.onChainMetadata.data.data.symbol
        nftDbDto.sellerFeeBasisPoints = this.onChainMetadata.data.data.sellerFeeBasisPoints
        nftDbDto.metadataUri = this.onChainMetadata.data.data.uri
        nftDbDto.creators = this.onChainMetadata.data.data?.creators.map(cr => {
            return {
                address: cr.address,
                share: cr.share,
                verified: cr.verified
            }
        })
        nftDbDto.assetUri = this.offChainMetadata?.image
        nftDbDto.description = this.offChainMetadata?.description
        nftDbDto.externalUrl = this.offChainMetadata?.external_url
        nftDbDto.attributes = {}
        this.offChainMetadata?.attributes.map((trait) => {
            nftDbDto.attributes[trait?.trait_type] = trait?.value
        })
        return nftDbDto
    }
}