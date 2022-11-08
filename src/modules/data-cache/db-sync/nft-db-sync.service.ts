import { Injectable } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { S3UploaderService } from 'src/common/utils/s3-uploader';
import { Utility } from 'src/common/utils/utils';
import { NftInfoAccessor } from 'src/dal/nft-repo/nft-info.accessor';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { RemoteDataFetcherService } from '../remote-data-fetcher/data-fetcher.service';
import { FetchAllNftDto, FetchAllNftByCreatorDto, NftData } from '../remote-data-fetcher/dto/data-fetcher.dto';
import {
  NftCacheEvent,
  NftCreationEvent,
  NftDeleteEvent,
  NftReadByCreatorEvent,
  NftSyncEvent,
  NftWalletSyncEvent,
  SaveNftsInDbEvent,
  NftWaitSyncEvent,
} from './db.events';
import * as fastq from 'fastq';
import { queueAsPromised } from 'fastq';
import { WalletDbSyncService } from './wallet-db-sync.service';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Timer } from 'src/common/utils/timer';
import { Metadata } from '@metaplex-foundation/js';

const afterNftCreationWaitTime_ms = 12000;
const afterNftUpdateWaitTime_ms = 12000;

@Injectable()
export class NFtDbSyncService {
  constructor(
    private eventEmitter: EventEmitter2,
    private remoteDataFetcher: RemoteDataFetcherService,
    private nftDbAccessor: NftInfoAccessor,
    private walletDbSyncSvc: WalletDbSyncService,
    private s3: S3UploaderService,
  ) {}
  fetchNftQueue: queueAsPromised = fastq.promise<NFtDbSyncService, NftSyncEvent, NftInfo>(
    this,
    this.getNftInfoDto,
    100,
  );
  cacheNftQueue: queueAsPromised = fastq.promise<NFtDbSyncService, NftCacheEvent>(this, this.cacheNft, 10);

  @OnEvent('nft.created', { async: true })
  private async handleNftCreatedEvent(event: NftCreationEvent): Promise<any> {
    try {
      // it takes some time to newly created data on blockchain to be available for read
      setTimeout(async () => {
        try {
          const res = await this.fetchNftQueue.push(event);
          res.api_key_id = event.apiKeyId;
          await this.syncAndCache(res);
        } catch (error) {
          console.error('nft.created error: ', error);
        }
      }, afterNftCreationWaitTime_ms);
    } catch (err) {
      console.error(err);
    }
  }

  @OnEvent('save.nft.db', { async: true })
  private async syncAndCache(response: NftInfo) {
    try {
      const result = await this.nftDbAccessor.updateNft(response);

      if (result) {
        const nftCacheEvent = new NftCacheEvent(result?.image_uri, result?.mint, result?.network);
        this.eventEmitter.emit('nft.cache', nftCacheEvent);
      }
    } catch (error) {
      console.log(error);
    }
  }

  @OnEvent('nft.transfered')
  async handleNftTransferEvent(event: NftWaitSyncEvent): Promise<any> {
    const handler = this.syncNftData.bind(this);
    Timer.setTimer(handler, event, event.waitTime);
  }

  @OnEvent('nft.read', { async: true })
  private async handleNftReadEvent(event: NftSyncEvent): Promise<any> {
    try {
      await this.syncNftData(event);
    } catch (err) {
      console.error('nft.read', err);
    }
  }

  @OnEvent('resync.wallet.nfts', { async: true })
  private async handleWalletNftSyncEvent(event: NftWalletSyncEvent): Promise<any> {
    try {
      console.log('resyncing wallet nfts');
      await this.syncWalletNfts(event);
      await this.walletDbSyncSvc.saveWalletInDB(event.network, event.walletAddress);
    } catch (err) {
      console.error(err);
    }
  }

  //Remove deleted NFTs from DB and sync wallet NFTs again
  async syncWalletNfts(event: NftWalletSyncEvent) {
    try {
      const onChainNfts = await this.remoteDataFetcher.fetchAllNfts(
        new FetchAllNftDto(event.network, event.walletAddress, event.updateAuthority),
      );
      //Db Nfts
      const dbNfts = event?.dbNfts;
      console.log('on chain: ', onChainNfts.length, 'DB Nfts: ', dbNfts.length);

      //Clear Deleted NFTs from DB
      await this.syncDeletedWalletNfts(onChainNfts, dbNfts, event.network);

      //Add new Wallet NFTs to DB
      await this.syncNewWalletNfts(onChainNfts, dbNfts, event.network, event.walletAddress);

      await this.syncNotLoadedNfts(onChainNfts, dbNfts, event.network, event.walletAddress);
      return onChainNfts;
    } catch (error) {
      throw error;
    }
  }

  private async syncNotLoadedNfts(
    onChainNfts: Metadata[],
    dbNfts: NftInfo[],
    network: WalletAdapterNetwork,
    walletAddress: string,
  ): Promise<any> {
    const notLoadedNfts = onChainNfts.filter((value) => {
      return dbNfts.some((dbNft) => {
        return dbNft.mint === value.mintAddress.toBase58() && !dbNft.is_loaded_metadata;
      });
    });
    if (notLoadedNfts.length) {
      const nfts = await this.remoteDataFetcher.addOffChainDataAndOwner(notLoadedNfts, walletAddress);
      await this.saveWalletNftsInDb(new SaveNftsInDbEvent(network, walletAddress, nfts));
    }
    console.log('resync old NFTs, those metadata not loaded ', notLoadedNfts.length);
  }

  async syncNewWalletNfts(onChainNfts: Metadata[], dbNfts: NftInfo[], network: WalletAdapterNetwork, wallet: string) {
    //Get their diff and figure out which nfts we need to add
    const nftsToAdd = onChainNfts.filter((value) => {
      return dbNfts.some((dbNft) => {
        return dbNft.mint === value.mintAddress.toBase58();
      })
        ? false
        : true;
    });
    if (nftsToAdd.length) {
      const nfts = await this.remoteDataFetcher.addOffChainDataAndOwner(nftsToAdd, wallet);
      await this.saveWalletNftsInDb(new SaveNftsInDbEvent(network, wallet, nfts));
    }
    console.log('new NFTs added ', nftsToAdd.length);
  }

  async syncDeletedWalletNfts(onChainNfts: Metadata[], dbNfts: NftInfo[], network: WalletAdapterNetwork) {
    //Get their diff and figure out which nfts we need to delete
    const nftsToDel = dbNfts.filter((value) => {
      return onChainNfts.some((dbNft) => {
        return dbNft.mintAddress.toBase58() === value.mint;
      })
        ? false
        : true;
    });

    if (nftsToDel.length) {
      const nftAddresses = nftsToDel.flatMap((val) => {
        return val.mint;
      });
      await this.clearDeletedNftsFromDb(nftAddresses, network);
    }
    console.log('deleting NFTs: ', nftsToDel.length);
  }

  @OnEvent('save.wallet.nfts', { async: true })
  private async handleWalletNftSave(event: SaveNftsInDbEvent): Promise<any> {
    await this.saveWalletNftsInDb(event);
    await this.walletDbSyncSvc.saveWalletInDB(event.network, event.walletAddress);
  }

  private async saveWalletNftsInDb(event: SaveNftsInDbEvent) {
    try {
      const nfts = event.nfts;
      const network = event.network;
      const owner = event.walletAddress;
      const nftInfos: NftInfo[] = await Promise.all(
        nfts?.map(async (nft) => {
          const info = nft?.getNftInfoDto();
          info.network = network;
          info.owner = owner;
          return info;
        }),
      );
      console.log('saving nfts in DB');
      //Update DBs
      try {
        await this.nftDbAccessor.updateManyNft(nftInfos);
        console.log('nfts added to DB DONE! ', nftInfos.length);
      } catch (error) {
        console.error(error);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async clearDeletedNftsFromDb(nft_addresses: string[], network: WalletAdapterNetwork) {
    try {
      const res = await this.nftDbAccessor.deleteManyNfts(nft_addresses, network);
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent('all.nfts.read.by.creator', { async: true })
  async handleAllNftReadByCreatorEvent(event: NftReadByCreatorEvent): Promise<any> {
    try {
      let nfts: NftInfo[];
      if (event.nfts) {
        nfts = event.nfts;
      } else {
        const defaultPage = 1;
        const defaultSize = 20;
        const fetchAllNftDto = new FetchAllNftByCreatorDto(event.network, event.creator, defaultPage, defaultSize);
        const chainNfts = await this.remoteDataFetcher.fetchAllNftsByCreator(fetchAllNftDto);
        nfts = chainNfts.nfts.map((nft) => nft.getNftInfoDto());
      }
      await this.nftDbAccessor.updateManyNft(nfts);
    } catch (err) {
      console.error(err);
    }
  }

  @OnEvent('nft.updated', { async: true })
  private async handleUpdateNftEvent(event: NftSyncEvent): Promise<any> {
    try {
      setTimeout(async () => {
        try {
          await this.syncNftData(event);
        } catch (error) {
          console.error(error);
        }
      }, afterNftUpdateWaitTime_ms);
    } catch (err) {
      console.error(err);
    }
  }

  @OnEvent('nft.deleted', { async: true })
  private async handleDeleteNftEvent(event: NftDeleteEvent) {
    try {
      const result = await this.nftDbAccessor.deleteNft(event.tokenAddress, event.network);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  @OnEvent('nft.cache', { async: true })
  private async cacheNftEvent(event: NftCacheEvent): Promise<any> {
    try {
      await this.cacheNftQueue.push(event);
    } catch (error) {
      console.error(error);
    }
  }

  private async cacheNft(event: NftCacheEvent): Promise<any> {
    try {
      if (!event.metadataImageUri || !event.mint || !event.network) {
        console.log('invalid cache params: ', event);
        return false;
      }
      const s3Key = Utility.s3.getS3ImgKey(event.metadataImageUri);
      let cdnUrl = Utility.s3.getImgCdnUrl(s3Key);
      const existsInS3 = await this.s3.keyExists(s3Key);
      const dbNft = await this.nftDbAccessor.findOne({
        mint: event.mint,
        network: event.network,
      });
      //upload only if doesnt exists in S3
      if (!existsInS3) {
        console.log('Downloading data');
        const response = await Utility.downloadFile(event.metadataImageUri);
        if (response?.data && response?.contentType) {
          console.log('uploading data');
          cdnUrl = await this.s3.upload(event.metadataImageUri, response.data, response.contentType);
        }
      }
      //Save encoded URI in DB
      const encodedCdnUrl = encodeURI(cdnUrl);
      //Update DB, only if our DB uri and s3 uri dont match. S3 uri needs to be updated in the DB
      if (dbNft?.cached_image_uri !== encodedCdnUrl) {
        console.log('updating nft');
        dbNft.cached_image_uri = encodedCdnUrl;
        await this.nftDbAccessor.updateNft(dbNft);
        //to-do: Also trigger a delete event
      }
      return true;
    } catch (error) {
      console.log(`caching failed ${event.metadataImageUri}: `, error);
      return false;
    }
  }

  private async syncNftData(event: NftSyncEvent) {
    try {
      const res = await this.fetchNftQueue.push(event);
      this.syncAndCache(res);
    } catch (err) {
      throw err;
    }
  }

  async getNftInfoDto(dto: NftSyncEvent): Promise<NftInfo> {
    try {
      const nftData = await this.remoteDataFetcher.fetchNftDetails(dto);
      const nftDbDto = nftData.getNftInfoDto();
      nftDbDto.network = dto.network;
      return nftDbDto;
    } catch (error) {
      throw error;
    }
  }
}
