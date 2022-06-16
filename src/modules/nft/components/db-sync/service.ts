/*
event listerner to trigger the blockchain and ipfs read operations
update the stored db schema
*/

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RemoteDataFetcherService } from '../remote-data-fetcher/data-fetcher.service';
import { FetchNftDto } from '../remote-data-fetcher/dto/data-fetcher.dto';
import { NftCreationEvent } from './events';

@Injectable()
export class NftOperationsEventListener {
    constructor(private remoteDataFetcher: RemoteDataFetcherService) { }

    @OnEvent('nft.created')
    handleNftCreatedEvent(event: NftCreationEvent) {
        this.remoteDataFetcher.fetchNft(new FetchNftDto(event.network, event.tokenAddress))
            .then(metadata => {
                console.log(metadata)
            })
    }
}

