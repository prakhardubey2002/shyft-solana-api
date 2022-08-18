import { HttpException, Injectable, ParseBoolPipe } from '@nestjs/common';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadAllNftDto } from './dto/read-all-nft.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NftReadEvent, NftReadInWalletEvent } from '../../../helper/db-sync/db.events';
import { RemoteDataFetcherService } from '../../../helper/remote-data-fetcher/data-fetcher.service';
import { NftInfoAccessor } from '../../../../dal/nft-repo/nft-info.accessor';
import { FetchAllNftDto, FetchNftDto, NftDbResponse } from '../../../helper/remote-data-fetcher/dto/data-fetcher.dto';
import { getNftDbResponseFromNftInfo } from 'src/dal/nft-repo/nft-info.helper';

@Injectable()
export class ReadNftService {
  constructor(private remoteDataFetcher: RemoteDataFetcherService, private nftInfoAccessor: NftInfoAccessor, private eventEmitter: EventEmitter2) { }

  async readAllNfts(readAllNftDto: ReadAllNftDto): Promise<any> {
    try {
      const { network, address, update_authority } = readAllNftDto;

      //If refresh is not present in query string, we fetch from DB
      const fetchFromDB = readAllNftDto.refresh === undefined;

      const fetchAllNft = new FetchAllNftDto(network, address, update_authority);
      const dbFilter = { owner: address, network: network };

      if (update_authority) {
        dbFilter['update_authority'] = update_authority;
      }

      const dbNftInfo = fetchFromDB ? await this.nftInfoAccessor.find(dbFilter) : false;

      const nftReadInWalletEvent = new NftReadInWalletEvent(address, network, update_authority);
      this.eventEmitter.emit('all.nfts.read', nftReadInWalletEvent);

      if (dbNftInfo && dbNftInfo.length) {
        return dbNftInfo.map((nft) => {
          return getNftDbResponseFromNftInfo(nft);
        });
      } else {
        //not available in DB, fetch from blockchain
        const chainNfts = await this.remoteDataFetcher.fetchAllNftDetails(fetchAllNft);
        return chainNfts?.map((nft) => nft.getNftDbResponse());
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async readNft(readNftDto: ReadNftDto): Promise<NftDbResponse> {
    try {
      const { network, token_address } = readNftDto;

      //If refresh is not present in query string, we fetch from DB
      const fetchFromDB = readNftDto.refresh === undefined;

      const fetchNft = new FetchNftDto(network, token_address);

      //Fetch from DB, if refresh is false
      const dbNftInfo = fetchFromDB ? await this.nftInfoAccessor.readNft({ mint: readNftDto.token_address, network: network }) : false;

      //Trigger read event, to update DB (to-do:can be skipped)
      const nftReadEvent = new NftReadEvent(token_address, network);
      this.eventEmitter.emit('nft.read', nftReadEvent);

      if (dbNftInfo) {
        return getNftDbResponseFromNftInfo(dbNftInfo);
      } else {
        //not available in DB, fetch from blockchain
        return (await this.remoteDataFetcher.fetchNftDetails(fetchNft)).getNftDbResponse();
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
