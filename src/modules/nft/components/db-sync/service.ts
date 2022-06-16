import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NftInfoAccessor } from 'src/dal/nft-repo/nft-info.accessor';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { RemoteDataFetcherService } from '../remote-data-fetcher/data-fetcher.service';
import { FetchNftDto } from '../remote-data-fetcher/dto/data-fetcher.dto';
import { NftCreationEvent } from './events';

const afterNftCreationWaitTime_ms = 5000

@Injectable()
export class NftOperationsEventListener {
    constructor(private remoteDataFetcher: RemoteDataFetcherService, private nftInfoAccessor: NftInfoAccessor) { }

    @OnEvent('nft.created')
    handleNftCreatedEvent(event: NftCreationEvent) {
        this.delay(afterNftCreationWaitTime_ms)
            .then(() => {
                this.remoteDataFetcher.fetchNft(new FetchNftDto(event.network, event.tokenAddress))
                    .then(metadata => {
                        let data = <Metadata>metadata.onChainMetadata
                        let nftDbDto = new NftInfo()
                        nftDbDto.chain = "sol"
                        nftDbDto.updateAuthority = data.data.updateAuthority
                        nftDbDto.mint = data.data.mint
                        nftDbDto.primarySaleHappened = data.data.primarySaleHappened
                        nftDbDto.isMutable = data.data.isMutable
                        nftDbDto.name = data.data.data.name
                        nftDbDto.symbol = data.data.data.symbol
                        nftDbDto.description = metadata.offChainMetadata?.description
                        nftDbDto.externalUrl = metadata.offChainMetadata?.external_url
                        nftDbDto.sellerFeeBasisPoints = data.data.data.sellerFeeBasisPoints
                        nftDbDto.share = data.data.data.creators[0].share
                        nftDbDto.assetUri = metadata.offChainMetadata?.image
                        nftDbDto.metadataUri = data.data.data.uri
                        nftDbDto.creatorAddress = data.data.data.creators[0].address
                        nftDbDto.verified = data.data.data.creators[0].verified
                        nftDbDto.attributes = {}
                        metadata.offChainMetadata?.attributes.map((trait) => {
                            nftDbDto.attributes[trait?.trait_type] = trait?.value
                        })
                        return this.nftInfoAccessor.insert(nftDbDto)
                    })
                    .then(result => {
                        console.log(result)
                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}