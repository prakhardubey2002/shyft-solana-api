import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

import { ReadNftDto } from './dto/read-nft.dto';
import { ReadAllNftDto } from './dto/read-all-nft.dto';
import { HttpService } from '@nestjs/axios';
import { nftHelper } from '../../nft.helper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NftReadEvent, NftReadInWalletEvent } from '../db-sync/events';
import { RemoteDataFetcherService } from '../remote-data-fetcher/data-fetcher.service';
import { FetchAllNftDto, FetchNftDto } from '../remote-data-fetcher/dto/data-fetcher.dto';

@Injectable()
export class ReadNftService {

  constructor(private httpService: HttpService, private remoteDataFetcher: RemoteDataFetcherService, private eventEmitter: EventEmitter2) { }
  async readAllNfts(readAllNftDto: ReadAllNftDto): Promise<any> {
    try {
      const { network, address } = readAllNftDto;
      let fetchAllNft = new FetchAllNftDto(network, address)
      let nftsmetadata = this.remoteDataFetcher.fetchAllNfts(fetchAllNft)

      // let nftReadInWalletEvent = new NftReadInWalletEvent(address)
      // this.eventEmitter.emit('nfts.in.wallet.read', nftReadInWalletEvent)

      return nftsmetadata;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async readNft(readNftDto: ReadNftDto): Promise<any> {
    try {
      const { network, token_address } = readNftDto;
      let fetchNft = new FetchNftDto(network, token_address)
      let onChainMetadata, offChainMetadata
      let metadata = await this.remoteDataFetcher.fetchNft(fetchNft)

      const body = nftHelper.parseMetadata(metadata.offChainMetadata);
      console.log(body)

      // let nftReadEvent = new NftReadEvent(token_address)
      // this.eventEmitter.emit('nfts.read', nftReadEvent)

      return body;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
