import { HttpException, Injectable } from '@nestjs/common';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadAllNftByCreatorDto, ReadAllNftDto } from './dto/read-all-nft.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NftReadByCreatorEvent,
  NftSyncEvent,
  NftWalletSyncEvent,
  SaveNftsInDbEvent,
} from '../../../data-cache/db-sync/db.events';
import { RemoteDataFetcherService } from '../../../data-cache/remote-data-fetcher/data-fetcher.service';
import { NftInfoAccessor } from '../../../../dal/nft-repo/nft-info.accessor';
import {
  FetchAllNftByCreatorDto,
  FetchNftDto,
  NftDbResponse,
} from '../../../data-cache/remote-data-fetcher/dto/data-fetcher.dto';
import { getNftDbResponseFromNftInfo } from 'src/dal/nft-repo/nft-info.helper';
import { Utility } from 'src/common/utils/utils';
import { ErrorCode } from 'src/common/utils/error-codes';
import { configuration } from 'src/common/configs/config';
import { newProgramErrorFrom } from 'src/core/program-error';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletDbSyncService } from 'src/modules/data-cache/db-sync/wallet-db-sync.service';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { NFtDbSyncService } from 'src/modules/data-cache/db-sync/nft-db-sync.service';

const WALLET_SYNC_TIME_INTERVAL = parseInt(configuration().walletSyncTimeInterval);

@Injectable()
export class ReadNftService {
  constructor(
    private remoteDataFetcher: RemoteDataFetcherService,
    private nftInfoAccessor: NftInfoAccessor,
    private walletSyncService: WalletDbSyncService,
    private nftSyncService: NFtDbSyncService,
    private eventEmitter: EventEmitter2,
  ) {}

  async readAllNfts(readAllNftDto: ReadAllNftDto): Promise<any> {
    try {
      const { network, address: walletAddress, update_authority: updateAuthority } = readAllNftDto;

      const sinceLastWalletSyncSec = await this.walletSyncService.getTimeElapsedUntilLastSyncSec(
        network,
        walletAddress,
      );
      console.log('time elapsed since last sync: ', sinceLastWalletSyncSec);

      const isFetchFromDB = readAllNftDto.refresh === undefined && sinceLastWalletSyncSec != ErrorCode.RECORD_NOT_FOUND;

      if (isFetchFromDB) {
        const isWalletResyncNeeded = sinceLastWalletSyncSec > WALLET_SYNC_TIME_INTERVAL;

        const response = await this.readNftsFromDB(network, walletAddress, updateAuthority, isWalletResyncNeeded);
        return response;
      }

      const response = await this.readNftsFromChain(walletAddress, network, updateAuthority);
      return response;
    } catch (error) {
      throw newProgramErrorFrom(error, 'read_all_nft_error');
    }
  }

  private async readNftsFromChain(
    walletAddress: string,
    network: WalletAdapterNetwork,
    updateAuthority: string,
  ): Promise<NftDbResponse[]> {
    console.log('reading from chain');
    const nftDataList = await this.remoteDataFetcher.fetchAllNftDetails({
      walletAddress: walletAddress,
      network: network,
      updateAuthority: updateAuthority,
    });

    this.eventEmitter.emit('save.wallet.nfts', new SaveNftsInDbEvent(network, walletAddress, nftDataList));
    const response = nftDataList?.map((nft) => nft.getNftDbResponse());
    return response;
  }

  private async readNftsFromDB(
    network: WalletAdapterNetwork,
    walletAddress: string,
    updateAuthority: string,
    isWalletResyncNeeded: boolean,
  ): Promise<NftDbResponse[]> {
    console.log('resync needed: ', isWalletResyncNeeded);
    console.log('reading from DB');
    const dbNftInfos = await this.nftInfoAccessor.findNftsByOwnerAndUpdateAuthority(
      network,
      walletAddress,
      updateAuthority,
    );

    if (isWalletResyncNeeded) {
      const nftWalletReadEvent = new NftWalletSyncEvent(network, walletAddress, updateAuthority, dbNftInfos);
      this.eventEmitter.emit('resync.wallet.nfts', nftWalletReadEvent);
    }
    const response = dbNftInfos.map((nft) => getNftDbResponseFromNftInfo(nft));
    return response;
  }

  private async readAllNftsByCreator(readAllNftByCreatorDto: ReadAllNftByCreatorDto): Promise<any> {
    try {
      const { network, creator_address, refresh } = readAllNftByCreatorDto;
      let { page, size } = readAllNftByCreatorDto;
      if (!page) page = 1;
      if (!size) size = 10;

      const dbFilter = {
        creators: { $elemMatch: { address: creator_address } },
        network: network,
      };

      const dbNftInfo = !refresh ? await this.nftInfoAccessor.find(dbFilter, page, size) : false;
      const totalData = !refresh ? await this.nftInfoAccessor.count(dbFilter) : 0;
      const totalPage = Math.ceil(totalData / size);

      if (dbNftInfo && dbNftInfo.length) {
        const nftReadByCreatorEvent = new NftReadByCreatorEvent(creator_address, network);
        this.eventEmitter.emit('all.nfts.read.by.creator', nftReadByCreatorEvent);

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
        const fetchAllNft = new FetchAllNftByCreatorDto(network, creator_address, page, size);
        const chainNfts = await this.remoteDataFetcher.fetchAllNftsByCreator(fetchAllNft);
        const { total } = chainNfts;
        const totalPage = Math.ceil(total / size);
        const nftInfo = chainNfts.nfts.map((nft) => nft.getNftInfoDto());
        const nftReadByCreatorEvent = new NftReadByCreatorEvent(creator_address, network, nftInfo);
        this.eventEmitter.emit('all.nfts.read.by.creator', nftReadByCreatorEvent);

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
      const { network, token_address: tokenAddress } = readNftDto;

      const dbNft = 'refresh' in readNftDto ? false : await this.readNftFromDB(tokenAddress, network);

      if (dbNft) {
        this.tryResyncNft(dbNft);
        return getNftDbResponseFromNftInfo(dbNft);
      } else {
        return await this.readAndSyncNftFromChain(tokenAddress, network);
      }
    } catch (error) {
      throw error;
    }
  }

  private tryResyncNft(nft: NftInfo) {
    if (nft) {
      const sinceLastUpdate = Utility.getElapsedTimeSec((<any>nft)?.updated_at);
      const resync = sinceLastUpdate > parseInt(configuration().nftSyncTimeInterval);

      if (resync) {
        console.log('resyncing');
        const nftReadEvent = new NftSyncEvent(nft.mint, <WalletAdapterNetwork>nft.network);
        this.eventEmitter.emit('nft.read', nftReadEvent);
      }
    }
  }

  private async readAndSyncNftFromChain(tokenAddress: string, network: WalletAdapterNetwork) {
    const nftInfoDto = await this.nftSyncService.getNftInfoDto(new FetchNftDto(network, tokenAddress));
    this.eventEmitter.emit('save.nft.db', nftInfoDto);

    return getNftDbResponseFromNftInfo(nftInfoDto);
  }

  async readNftFromDB(tokenAddress: string, network: WalletAdapterNetwork) {
    //Fetch from DB
    const dbNft = await this.nftInfoAccessor.readNft({
      mint: tokenAddress,
      network: network,
    });

    return dbNft;
  }
}
