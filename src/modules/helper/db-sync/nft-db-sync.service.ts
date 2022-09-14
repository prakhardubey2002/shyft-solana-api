import { Injectable } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { S3UploaderService } from 'src/common/utils/s3-uploader';
import { Utility } from 'src/common/utils/utils';
import { NftInfoAccessor } from 'src/dal/nft-repo/nft-info.accessor';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { RemoteDataFetcherService } from '../remote-data-fetcher/data-fetcher.service';
import {
  FetchNftDto,
  FetchAllNftDto,
  FetchAllNftByCreatorDto,
  NftDbResponse,
} from '../remote-data-fetcher/dto/data-fetcher.dto';
import {
  NftCacheEvent,
  NftCreationEvent,
  NftDeleteEvent,
  NftReadByCreatorEvent,
  NftSyncEvent,
  NftReadInWalletEvent,
} from './db.events';
import * as fastq from 'fastq';
import { queueAsPromised } from 'fastq'
import { getNftDbResponseFromNftInfo } from 'src/dal/nft-repo/nft-info.helper';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const afterNftCreationWaitTime_ms = 12000;
const afterNftUpdateWaitTime_ms = 12000;

@Injectable()
export class NFtDbSyncService {
  constructor(
    private eventEmitter: EventEmitter2,
    private remoteDataFetcher: RemoteDataFetcherService,
    private nftInfoAccessor: NftInfoAccessor,
    private s3: S3UploaderService,
  ) {}
  fetchNftQueue: queueAsPromised = fastq.promise<NFtDbSyncService, NftSyncEvent, NftInfo>(this, this.getNftDbDto, 100);
  cacheNftQueue: queueAsPromised = fastq.promise<NFtDbSyncService, NftCacheEvent>(this, this.cacheNft, 10);

  @OnEvent('nft.created', { async: true })
  async handleNftCreatedEvent(event: NftCreationEvent): Promise<any> {
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

  private async syncAndCache(response: NftInfo) {
    const result = await this.nftInfoAccessor.updateNft(response);

    const nftCacheEvent = new NftCacheEvent(result?.image_uri, result?.mint, result?.network);
    this.eventEmitter.emit('nft.cache', nftCacheEvent);
  }

  @OnEvent('nft.read', { async: true })
  async handleNftReadEvent(event: NftSyncEvent): Promise<any> {
    try {
      await this.syncNftData(event);
    } catch (err) {
      console.error('nft.read', err);
    }
  }

  @OnEvent('all.nfts.read', { async: true })
  async handleAllNftSyncEvent(event: NftReadInWalletEvent): Promise<any> {
    try {
      const nfts = await this.remoteDataFetcher.fetchAllNftDetails(
        new FetchAllNftDto(
          event.network,
          event.walletAddress,
          event.updateAuthority,
        ),
      );
      const nftInfos: NftInfo[] = await Promise.all(
        nfts?.map(async (nft) => {
          const info = nft?.getNftInfoDto();
          info.network = event.network;
          info.owner = event.walletAddress;
          return info;
        }),
      );
      await this.nftInfoAccessor.updateManyNft(nftInfos);
    } catch (err) {
      console.error(err);
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
      await this.nftInfoAccessor.updateManyNft(nfts);
    } catch (err) {
      console.error(err);
    }
  }

  @OnEvent('nft.updated', { async: true })
  async handleUpdateNftEvent(event: NftSyncEvent): Promise<any> {
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
  async handleDeleteNftEvent(event: NftDeleteEvent) {
    try {
      const result = await this.nftInfoAccessor.deleteNft({
        mint: event.tokenAddress,
        network: event.network,
      });
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  @OnEvent('nft.cache', { async: true })
  async cacheNftEvent(event: NftCacheEvent): Promise<any> {
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
      const dbNft = await this.nftInfoAccessor.findOne({
        mint: event.mint,
        network: event.network,
      });
      //upload only if doesnt exists in S3
      if (!existsInS3) {
        console.log('Downloading data');
        const response = await Utility.downloadFile(event.metadataImageUri);
        if (response?.data && response?.contentType) {
          console.log('uploading data');
          cdnUrl = await this.s3.upload(
            event.metadataImageUri,
            response.data,
            response.contentType,
          );
        }
      }
      //Save encoded URI in DB
      const encodedCdnUrl = encodeURI(cdnUrl);
      //Update DB, only if our DB uri and s3 uri dont match. S3 uri needs to be updated in the DB
      if (dbNft?.cached_image_uri !== encodedCdnUrl) {
        console.log('updating nft');
        dbNft.cached_image_uri = encodedCdnUrl;
        await this.nftInfoAccessor.updateNft(dbNft);
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

  private async getNftDbDto(event: NftSyncEvent): Promise<NftInfo> {
    try {
      const nftData = await this.remoteDataFetcher.fetchNftDetails(event);
      const nftDbDto = nftData.getNftInfoDto();
      nftDbDto.network = event.network;
      return nftDbDto;
    } catch (error) {
      throw error;
    }
  }
}
