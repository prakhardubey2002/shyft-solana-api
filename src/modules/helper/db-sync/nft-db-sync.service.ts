import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { S3UploaderService } from 'src/common/utils/s3-uploader';
import { Utility } from 'src/common/utils/utils';
import { NftInfoAccessor } from 'src/dal/nft-repo/nft-info.accessor';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { RemoteDataFetcherService } from '../remote-data-fetcher/data-fetcher.service';
import { FetchNftDto, FetchAllNftDto, FetchAllNftByCreatorDto } from '../remote-data-fetcher/dto/data-fetcher.dto';
import { NftCacheEvent, NftCreationEvent, NftDeleteEvent, NftReadByCreatorEvent, NftReadEvent, NftReadInWalletEvent, NftUpdateEvent } from './db.events';

const afterNftCreationWaitTime_ms = 7000;
const afterNftUpdateWaitTime_ms = 7000;

@Injectable()
export class NFtDbSyncService {
  constructor(
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
        await this.syncNftData(event);
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

  private async syncNftData(event: NftReadEvent): Promise<any> {
    try {
      const nftDbDto = await this.prepareNftDbDto(event);
      const result = await this.nftInfoAccessor.updateNft(nftDbDto);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  private async cacheNftData(event: NftCacheEvent): Promise<any> {
    try {
      const { fileUrl, image } = event;
      const isMatched = Utility.isUriMatched(fileUrl, image);
      
      if (!isMatched) {
        const oldCachedUrl = await this.nftInfoAccessor.findOne({ cached_image_uri: fileUrl });
        if (oldCachedUrl?.cached_image_uri) {
          await this.uploader.delete(oldCachedUrl?.cached_image_uri);
        }
        const response = await Utility.requestFileFromUrl(image);
        if (response?.data && response?.contentType) {
          const cachedUrl = await this.uploader.upload(image, response.data, response.contentType);
          return cachedUrl;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  private async prepareNftDbDto(event: NftReadEvent): Promise<NftInfo> {
    try {
      const nftData = await this.remoteDataFetcher.fetchNftDetails(new FetchNftDto(event.network, event.tokenAddress));
      const nftDbDto = nftData.getNftInfoDto();
      const oldCachedUri = (await this.nftInfoAccessor.findOne({ network: event.network, mint: event.tokenAddress }))?.cached_image_uri;
      const cachedImageUri = await this.cacheNftData(new NftCacheEvent(oldCachedUri, nftDbDto.image_uri));
      nftDbDto.cached_image_uri = cachedImageUri;
      nftDbDto.network = event.network;
      return nftDbDto;
    } catch (error) {
      console.error(error);
    }
  }
}
