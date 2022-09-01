import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccountInfo, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Connection, programs } from '@metaplex/js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bs58 from 'bs58';
import { Key } from '@metaplex-foundation/mpl-token-metadata';
import { Metadata, MetadataData } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { FetchNftDto, FetchAllNftDto, NftData, FetchAllNftByCreatorDto } from './dto/data-fetcher.dto';
import { Utility } from 'src/common/utils/utils';
import { Account } from 'src/common/utils/account';
import { NftDeleteEvent } from '../db-sync/db.events';

export interface RawMetaData {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
}

export interface MetadatasToTokens {
  mint: PublicKey;
  address: PublicKey;
  metadataPDA: PublicKey;
  metadataOnchain: MetadataData;
}

export interface PaginatedNftsResponse {
  nfts: NftData[];
  total: number;
}

@Injectable()
export class RemoteDataFetcherService {
  constructor(private eventEmitter: EventEmitter2) { }

  baseFilters = [
    // Filter for MetadataV1 by key
    {
      memcmp: {
        offset: 0,
        bytes: bs58.encode(Buffer.from([Key.MetadataV1])),
      },
    },
  ].filter(Boolean);

  deserializeMetadata(rawMetadata: RawMetaData): Metadata {
    const acc = new Account(rawMetadata.pubkey, rawMetadata.account);
    return Metadata.from(acc);
  }

  async getHolderByMint(connection: Connection, mint: PublicKey): Promise<PublicKey> {
    const tokens = await connection.getTokenLargestAccounts(mint);
    return tokens.value[0].address; // since it's an NFT, we just grab the 1st account
  }

  async metadatasToTokens(connection: Connection, rawMetadatas: RawMetaData[]): Promise<MetadatasToTokens[]> {
    const promises = await Promise.all(
      rawMetadatas.map(async (m) => {
        try {
          const metadata = this.deserializeMetadata(m);
          const mint = new PublicKey(metadata.data.mint);
          const address = await this.getHolderByMint(connection, mint);
          return {
            mint,
            address,
            metadataPDA: metadata.pubkey,
            metadataOnchain: metadata.data,
          };
        } catch (e) {
          console.log(e);
          console.log('failed to deserialize one of the fetched metadatas');
        }
      }),
    );
    return promises.filter((t) => !!t);
  }

  async getPage(connection: Connection, accountPublicKeys: PublicKey[], page: number, size: number): Promise<RawMetaData[]> {
    const paginatedPublicKeys = accountPublicKeys.slice(
      (page - 1) * size,
      page * size,
    );

    if (paginatedPublicKeys.length === 0) {
      return [];
    }

    const accountsWithData = await connection.getMultipleAccountsInfo(paginatedPublicKeys);
    // console.log(accountsWithData);
    const accountsWithRawData: RawMetaData[] = [];
    accountsWithData.forEach((key, i) => {
      accountsWithRawData.push({ pubkey: accountPublicKeys[i], account: key });
    });
    // console.log(accountsWithRawData);
    return accountsWithRawData;
  }

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
      const connection = new Connection(Utility.clusterUrl(network), 'confirmed');
      if (!tokenAddress) {
        throw new HttpException('Please provide any public or private key', HttpStatus.BAD_REQUEST);
      }
      const largestAcc = await connection.getTokenLargestAccounts(new PublicKey(tokenAddress));

      if (largestAcc?.value.length) {
        const ownerInfo = <any>(
          await connection.getParsedAccountInfo(largestAcc?.value[0]?.address)
        );
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
      const connection = new Connection(Utility.clusterUrl(network), 'confirmed');
      if (!tokenAddress) {
        throw new HttpException('Please provide any public or private key', HttpStatus.BAD_REQUEST);
      }
      const accInfo = <any>(
        await connection.getParsedAccountInfo(new PublicKey(tokenAddress))
      );
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
          throw new HttpException('No metadata account found', HttpStatus.NOT_FOUND);
        }

        return new NftData(metadata.data, uriRes);
      } else {
        //0 supply for the NFT, trigger a delete from DB just in case
        const delEvent = new NftDeleteEvent(fetchNftDto.tokenAddress, fetchNftDto.network);
        this.eventEmitter.emit('nft.deleted', delEvent);
      }

      throw new HttpException(`NFT not found on ${network}`, HttpStatus.BAD_REQUEST);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async fetchAllNftsByCreator(fetchAllNftByCreatorDto: FetchAllNftByCreatorDto): Promise<PaginatedNftsResponse> {
    try {
      const { network, creator, page, size } = fetchAllNftByCreatorDto;
      const connection = new Connection(Utility.clusterUrl(network), 'confirmed');
      const rawMetadatas = await connection.getProgramAccounts(
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
        {
          dataSlice: { offset: 0, length: 0 }, // Fetch without any data.
          filters: [
            ...this.baseFilters,
            {
              memcmp: {
                offset: programs.metadata.computeCreatorOffset(0),
                bytes: creator,
              },
            },
          ],
        },
      );
      const accountPublicKeys = rawMetadatas.map(account => account.pubkey);
      const pageResults = await this.getPage(connection, accountPublicKeys, page, size);
      const resultsWithMetaData = await this.metadatasToTokens(connection, pageResults);
      const nfts = resultsWithMetaData.map((x) => x.metadataOnchain)

      const result: NftData[] = [];
      // Run all offchain requests parallely instead of one by one
      const promises: Promise<NftData>[] = [];
      for (const oncd of nfts) {
        try {
          const owner = await this.fetchOwner({ network, tokenAddress: oncd.mint });
          if (owner) {
            promises.push(Utility.request(oncd.data.uri));
            result.push(new NftData(oncd, null, owner));
          }
        } catch (error) {
          //Ignore off chain data that cant be fetched or is taking too long.
          console.log('ignoring');
        }
      }

      const res = await Promise.allSettled(promises);

      res?.forEach((data, i) => {
        result[i].offChainMetadata = data.status === 'fulfilled' ? data.value : {};
      });
      return { nfts: result, total: accountPublicKeys.length };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
