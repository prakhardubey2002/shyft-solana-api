import { Injectable } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { NftInfoDocument } from 'src/dal/nft-repo/nft-info.schema';
import { S3UploaderService } from 'src/common/utils/s3-uploader';
import { Utility } from 'src/common/utils/utils';
import { NftInfoAccessor } from 'src/dal/nft-repo/nft-info.accessor';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { RemoteDataFetcherService } from '../remote-data-fetcher/data-fetcher.service';
import { FetchNftDto, FetchAllNftDto, FetchAllNftByCreatorDto } from '../remote-data-fetcher/dto/data-fetcher.dto';
import { NftCacheEvent, NftCreationEvent, NftDeleteEvent, NftReadByCreatorEvent, NftReadEvent, NftReadInWalletEvent, NftUpdateEvent } from './db.events';

const afterNftCreationWaitTime_ms = 15000;
const afterNftUpdateWaitTime_ms = 15000;

@Injectable()
export class NFtDbSyncService {
  constructor(
    private eventEmitter: EventEmitter2,
    private remoteDataFetcher: RemoteDataFetcherService,
    private nftInfoAccessor: NftInfoAccessor,
    private uploader: S3UploaderService,
  ) { }

  @OnEvent('nft.created', { async: true })
  async handleNftCreatedEvent(event: NftCreationEvent): Promise<any> {
    try {
      // it takes some time to newly created data on blockchain to be available for read
      setTimeout(async () => {
        const nftDbDto: NftInfo = await this.prepareNftDbDto(event);
        nftDbDto.api_key_id = event.apiKeyId;
        await this.nftInfoAccessor.insert(nftDbDto);
        const nftCacheEvent = new NftCacheEvent(nftDbDto.image_uri);
        this.eventEmitter.emit('nft.cache', nftCacheEvent);
      }, afterNftCreationWaitTime_ms);
    } catch (err) {
      console.error(err);
    }
  }

  @OnEvent('nft.read', { async: true })
  async handleNftReadEvent(event: NftReadEvent): Promise<any> {
    try {
      await this.syncNftData(event);
    } catch (err) {
      console.error(err);
    }
  }

  @OnEvent('all.nfts.read', { async: true })
  async handleAllNftReadEvent(event: NftReadInWalletEvent): Promise<any> {
    try {
      const nfts = await this.remoteDataFetcher.fetchAllNftDetails(new FetchAllNftDto(event.network, event.walletAddress, event.updateAuthority));
      const nftInfos: NftInfo[] = await Promise.all(nfts?.map(async (nft) => {
        const info = nft?.getNftInfoDto();
        info.network = event.network;
        info.owner = event.walletAddress;
        return info;
      }));
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
  async handleUpdateNftEvent(event: NftUpdateEvent): Promise<any> {
    try {
      setTimeout(async () => {
        const result = await this.syncNftData(event);
        const nftCacheEvent = new NftCacheEvent(result.image_uri);
        this.eventEmitter.emit('nft.cache', nftCacheEvent);
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
      const { ipfsFileUri, cachedFileUri } = event;
      const isMatched = Utility.isUriMatched(ipfsFileUri, cachedFileUri);

      if (!isMatched) {
        const oldData = await this.nftInfoAccessor.findOne({ cached_image_uri: cachedFileUri });
        if (oldData?.cached_image_uri) {
          await this.uploader.delete(oldData?.cached_image_uri);
        }
        const response = await Utility.requestFileFromUrl(ipfsFileUri);
        if (response?.data && response?.contentType) {
          const cachedUrl = await this.uploader.upload(ipfsFileUri, response.data, response.contentType);
          oldData.cached_image_uri = cachedUrl;
          await this.nftInfoAccessor.updateNft(oldData);
          return cachedUrl;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async syncNftData(event: NftReadEvent): Promise<NftInfoDocument> {
    try {
      const nftDbDto = await this.prepareNftDbDto(event);
      const result = await this.nftInfoAccessor.updateNft(nftDbDto);
      const nftCacheEvent = new NftCacheEvent(nftDbDto.image_uri, result.cached_image_uri);
      this.eventEmitter.emit('nft.cache', nftCacheEvent);
      return result;
    } catch (err) {
      console.error(err);
    }
  }
  
  private async prepareNftDbDto(event: NftReadEvent): Promise<NftInfo> {
    try {
      const nftData = await this.remoteDataFetcher.fetchNftDetails(new FetchNftDto(event.network, event.tokenAddress));
      const nftDbDto = nftData.getNftInfoDto();
      nftDbDto.network = event.network;
      return nftDbDto;
    } catch (error) {
      console.error(error);
    }
  }
}
