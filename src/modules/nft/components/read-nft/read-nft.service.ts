import { HttpException, Injectable } from '@nestjs/common';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadAllNftDto } from './dto/read-all-nft.dto';
import { HttpService } from '@nestjs/axios';
import { nftHelper } from '../../nft.helper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NftReadEvent, NftReadInWalletEvent } from '../db-sync/events';
import { RemoteDataFetcherService } from '../remote-data-fetcher/data-fetcher.service';
import {
  FetchAllNftDto,
  FetchNftDto,
} from '../remote-data-fetcher/dto/data-fetcher.dto';

@Injectable()
export class ReadNftService {
  constructor(
    private httpService: HttpService,
    private remoteDataFetcher: RemoteDataFetcherService,
    private eventEmitter: EventEmitter2,
  ) {}
  async readAllNfts(readAllNftDto: ReadAllNftDto): Promise<any> {
    try {
      const { network, address } = readAllNftDto;
      const fetchAllNft = new FetchAllNftDto(network, address);
      const nftsmetadata = await this.remoteDataFetcher.fetchAllNfts(
        fetchAllNft,
      );

      const nftReadInWalletEvent = new NftReadInWalletEvent(address, network);
      await this.eventEmitter.emitAsync('all.nfts.read', nftReadInWalletEvent);

      return nftsmetadata;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async readNft(readNftDto: ReadNftDto): Promise<any> {
    try {
      const { network, token_address } = readNftDto;
      const fetchNft = new FetchNftDto(network, token_address);
      const metadata = await this.remoteDataFetcher.fetchNft(fetchNft);

      const result = nftHelper.parseMetadata(metadata.offChainMetadata);

      const nftReadEvent = new NftReadEvent(token_address, network);
      await this.eventEmitter.emitAsync('nft.read', nftReadEvent);

      return result;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
