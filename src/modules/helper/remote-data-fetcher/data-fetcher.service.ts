import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl, ParsedAccountData, PublicKey } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { Metadata, MetadataData } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { FetchNftDto, FetchAllNftDto, NftData } from './dto/data-fetcher.dto';
import { Utility } from 'src/common/utils/utils';
import { NftDeleteEvent } from '../db-sync/db.events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RemoteDataFetcherService {
  constructor(private eventEmitter: EventEmitter2) { }
  async fetchAllNfts(fetchAllNftDto: FetchAllNftDto): Promise<MetadataData[]> {
    try {
      const { network, walletAddress } = fetchAllNftDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      if (!walletAddress) {
        throw new HttpException('Please provide any public or private key', HttpStatus.BAD_REQUEST);
      }

      const nfts = await Metadata.findDataByOwner(connection, walletAddress);
      return nfts;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async fetchAllNftDetails(fetchAllNftDto: FetchAllNftDto): Promise<NftData[]> {
    let nfts = await this.fetchAllNfts(fetchAllNftDto);
    //Filter based on updateAuthority if any
    if (fetchAllNftDto.updateAuthority) {
      nfts = nfts.filter((nft) => {
        return nft.updateAuthority === fetchAllNftDto.updateAuthority;
      });
    }

    const result: NftData[] = [];

    //Run all offchain requests parallely instead of one by one
    const promises: Promise<NftData>[] = [];
    for (const oncd of nfts) {
      try {
        promises.push(Utility.request(oncd.data.uri));
        //No need to fetch owner, we have the wallet Id
        const owner = fetchAllNftDto.walletAddress;
        result.push(new NftData(oncd, null, owner));
      } catch (error) {
        //Ignore off chain data that cant be fetched or is taking too long.
        console.log('ignoring');
      }
    }

    const res = await Promise.allSettled(promises);

    res?.forEach((data, i) => {
      result[i].offChainMetadata = data.status === 'fulfilled' ? data.value : {};
    });
    return result;
  }

  async fetchOwner(fetchNftDto: FetchNftDto): Promise<string> {
    try {
      const { network, tokenAddress } = fetchNftDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      if (!tokenAddress) {
        throw new HttpException('Please provide any public or private key', HttpStatus.BAD_REQUEST);
      }
      const largestAcc = await connection.getTokenLargestAccounts(new PublicKey(tokenAddress));

      if (largestAcc?.value.length) {
        const ownerInfo = <any>await connection.getParsedAccountInfo(largestAcc?.value[0]?.address);
        return ownerInfo.value?.data?.parsed?.info?.tokenAmount.uiAmount > 0
          ? ownerInfo.value?.data?.parsed?.info?.owner
          : 'None';
      }

      return 'None';
    } catch (error) {
      console.log(error.message);
      throw new HttpException(error.message, error.status);
    }
  }

  //Fetches Nft's onchain and off chain metadata + owner
  async fetchNftDetails(fetchNftDto: FetchNftDto): Promise<NftData> {
    try {
      if (!fetchNftDto.tokenAddress) {
        throw new HttpException('Please provide any public or private key', HttpStatus.BAD_REQUEST);
      }
      const nftData = await this.fetchNft(fetchNftDto);
      nftData.owner = await this.fetchOwner(fetchNftDto);

      return nftData;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async fetchNft(fetchNftDto: FetchNftDto): Promise<NftData> {
    try {
      const { network, tokenAddress } = fetchNftDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      if (!tokenAddress) {
        throw new HttpException('Please provide any public or private key', HttpStatus.BAD_REQUEST);
      }
      const accInfo = <any>await connection.getParsedAccountInfo(new PublicKey(tokenAddress));
      const supply = parseInt(accInfo?.value?.data?.parsed?.info?.supply);
      if (supply) {
        const pda = await Metadata.getPDA(new PublicKey(tokenAddress));
        const metadata = await Metadata.load(connection, pda);
        let uriRes = {};

        try {
          uriRes = await Utility.request(metadata.data.data.uri);
        } catch (error) {
          console.log(error);
        }

        if (!metadata) {
          throw new HttpException("No metadata account found", HttpStatus.NOT_FOUND);
        }

        return new NftData(metadata.data, uriRes);
      } else {
        //0 supply for the NFT, trigger a delete from DB just in case
        const delEvent = new NftDeleteEvent(fetchNftDto.tokenAddress, fetchNftDto.network);
        this.eventEmitter.emit('nft.deleted', delEvent);
      }

      throw new HttpException('0 supply for the NFT, deleted maybe', HttpStatus.BAD_REQUEST);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
