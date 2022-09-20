import { HttpException, Injectable } from '@nestjs/common';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadAllNftByCreatorDto, ReadAllNftDto } from './dto/read-all-nft.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NftReadByCreatorEvent,
  NftSyncEvent,
  NftReadInWalletEvent,
} from '../../../data-cache/db-sync/db.events';
import { RemoteDataFetcherService } from '../../../data-cache/remote-data-fetcher/data-fetcher.service';
import { NftInfoAccessor } from '../../../../dal/nft-repo/nft-info.accessor';
import {
  FetchAllNftByCreatorDto,
  FetchAllNftDto,
  FetchNftDto,
  NftDbResponse,
} from '../../../data-cache/remote-data-fetcher/dto/data-fetcher.dto';
import { getNftDbResponseFromNftInfo } from 'src/dal/nft-repo/nft-info.helper';
import { Utility } from 'src/common/utils/utils';

@Injectable()
export class ReadNftService {
  constructor(
    private remoteDataFetcher: RemoteDataFetcherService,
    private nftInfoAccessor: NftInfoAccessor,
    private eventEmitter: EventEmitter2,
  ) {}

  async readAllNfts(readAllNftDto: ReadAllNftDto): Promise<any> {
    try {
      const { network, address, update_authority } = readAllNftDto;

      //If refresh is not present in query string, we fetch from DB
      const fetchFromDB = readAllNftDto.refresh === undefined;

      const fetchAllNft = new FetchAllNftDto(
        network,
        address,
        update_authority,
      );
      const dbFilter = { owner: address, network: network };

      if (update_authority) {
        dbFilter['update_authority'] = update_authority;
      }

      const dbNftInfo = fetchFromDB
        ? await this.nftInfoAccessor.find(dbFilter)
        : false;

      const nftReadInWalletEvent = new NftReadInWalletEvent(
        address,
        network,
        update_authority,
      );
      this.eventEmitter.emit('all.nfts.read', nftReadInWalletEvent);

      if (dbNftInfo && dbNftInfo.length) {
        return dbNftInfo.map((nft) => {
          return getNftDbResponseFromNftInfo(nft);
        });
      } else {
        //not available in DB, fetch from blockchain
        const chainNfts = await this.remoteDataFetcher.fetchAllNftDetails(
          fetchAllNft,
        );
        return chainNfts?.map((nft) => nft.getNftDbResponse());
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async readAllNftsByCreator(
    readAllNftByCreatorDto: ReadAllNftByCreatorDto,
  ): Promise<any> {
    try {
      const { network, creator_address, refresh } = readAllNftByCreatorDto;
      let { page, size } = readAllNftByCreatorDto;
      if (!page) page = 1;
      if (!size) size = 10;

      const dbFilter = {
        creators: { $elemMatch: { address: creator_address } },
        network: network,
      };

      const dbNftInfo = !refresh
        ? await this.nftInfoAccessor.find(dbFilter, page, size)
        : false;
      const totalData = !refresh
        ? await this.nftInfoAccessor.count(dbFilter)
        : 0;
      const totalPage = Math.ceil(totalData / size);

      if (dbNftInfo && dbNftInfo.length) {
        const nftReadByCreatorEvent = new NftReadByCreatorEvent(
          creator_address,
          network,
        );
        this.eventEmitter.emit(
          'all.nfts.read.by.creator',
          nftReadByCreatorEvent,
        );

        return dbNftInfo.map((nft) => {
          return {
            nfts: getNftDbResponseFromNftInfo(nft),
            page,
            size,
            total_data: totalData,
            total_page: totalPage,
          };
        });
      } else {
        //not available in DB, fetch from blockchain
        const fetchAllNft = new FetchAllNftByCreatorDto(
          network,
          creator_address,
          page,
          size,
        );
        const chainNfts = await this.remoteDataFetcher.fetchAllNftsByCreator(
          fetchAllNft,
        );
        const { total } = chainNfts;
        const totalPage = Math.ceil(total / size);
        const nftInfo = chainNfts.nfts.map((nft) => nft.getNftInfoDto());
        const nftReadByCreatorEvent = new NftReadByCreatorEvent(
          creator_address,
          network,
          nftInfo,
        );
        this.eventEmitter.emit(
          'all.nfts.read.by.creator',
          nftReadByCreatorEvent,
        );

        const nfts = chainNfts.nfts.map((nft) => nft.getNftDbResponse());
        return { nfts, page, size, total_data: total, total_page: totalPage };
      }
    } catch (error) {
      console.log(error);
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
      const dbNftInfo = fetchFromDB
        ? await this.nftInfoAccessor.readNft({
            mint: readNftDto.token_address,
            network: network,
          })
        : false;
      //Check should we resync
      const sinceLastUpdate = Utility.getElapsedTimeSec(
        (<any>dbNftInfo)?.updated_at,
      );
      const resync = !fetchFromDB || sinceLastUpdate > 2 * 60;

      //Trigger read event, if refreshing or if last update > 1 day
      if (!dbNftInfo || resync) {
        const nftReadEvent = new NftSyncEvent(token_address, network);
        this.eventEmitter.emit('nft.read', nftReadEvent);
      }

      if (dbNftInfo) {
        return getNftDbResponseFromNftInfo(dbNftInfo);
      } else {
        //not available in DB, fetch from blockchain
        return (
          await this.remoteDataFetcher.fetchNftDetails(fetchNft)
        ).getNftDbResponse();
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
