import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { Connection, programs } from '@metaplex/js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bs58 from 'bs58';
import { Key } from '@metaplex-foundation/mpl-token-metadata';
import { FetchNftDto, FetchAllNftDto, NftData, FetchAllNftByCreatorDto } from './dto/data-fetcher.dto';
import { Utility } from 'src/common/utils/utils';
import { NftDeleteEvent } from '../db-sync/db.events';
import { newProgramError, newProgramErrorFrom } from 'src/core/program-error';
import { Metaplex, Nft, Account, toMetadataAccount, toMetadata, Metadata } from '@metaplex-foundation/js';

export interface RawMetaData {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
}

export interface MetadatasToTokens {
  mint: PublicKey;
  address: PublicKey;
  metadataPDA: PublicKey;
  metadataOnchain: Metadata;
}

export interface PaginatedNftsResponse {
  nfts: NftData[];
  total: number;
}

@Injectable()
export class RemoteDataFetcherService {
  constructor(private eventEmitter: EventEmitter2) {}

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
    const acc: Account<any> = {
      publicKey: rawMetadata.pubkey,
      executable: rawMetadata.account.executable,
      owner: rawMetadata.account.owner,
      lamports: rawMetadata.account.lamports,
      data: rawMetadata.account.data,
      rentEpoch: rawMetadata.account.rentEpoch,
    };

    const metadataAccount = toMetadataAccount(acc);
    const metadata = toMetadata(metadataAccount);
    return metadata;
  }

  async getPage(
    connection: Connection,
    accountPublicKeys: PublicKey[],
    page: number,
    size: number,
  ): Promise<RawMetaData[]> {
    const paginatedPublicKeys = accountPublicKeys.slice((page - 1) * size, page * size);

    if (paginatedPublicKeys.length === 0) {
      return [];
    }

    const accountsWithData = await connection.getMultipleAccountsInfo(paginatedPublicKeys);
    const accountsWithRawData: RawMetaData[] = [];
    accountsWithData.forEach((key, i) => {
      accountsWithRawData.push({ pubkey: accountPublicKeys[i], account: key });
    });
    return accountsWithRawData;
  }

  async fetchAllNfts(fetchAllNftDto: FetchAllNftDto): Promise<Metadata[]> {
    try {
      const { network, walletAddress } = fetchAllNftDto;
      const connection = Utility.connectRpc(network);
      const metaplex = new Metaplex(connection);
      if (!walletAddress) {
        throw new HttpException('Incorrect Wallet Address', HttpStatus.BAD_REQUEST);
      }

      const nfts: Metadata[] = await metaplex.nfts().findAllByOwner(walletAddress).run();
      return nfts;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async fetchAllNftDetails(fetchAllNftDto: FetchAllNftDto): Promise<NftData[]> {
    try {
      let onChainNfts = await this.fetchAllNfts(fetchAllNftDto);
      //Filter based on updateAuthority if any
      if (fetchAllNftDto.updateAuthority) {
        onChainNfts = onChainNfts.filter((nft) => {
          return nft.updateAuthorityAddress.toBase58() === fetchAllNftDto.updateAuthority;
        });
      }
      const nfts = await this.addOffChainDataAndOwner(onChainNfts, fetchAllNftDto.walletAddress);
      return nfts;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async addOffChainDataAndOwner(onChainNfts: Metadata[], walletAddress: string): Promise<NftData[]> {
    const result: NftData[] = [];

    //Run all offchain requests parallely instead of one by one
    const promises: Promise<NftData>[] = [];
    for (const oncd of onChainNfts) {
      try {
        promises.push(Utility.request(oncd.uri));
        //No need to fetch owner, we have the wallet Id
        const owner = walletAddress;
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
      const connection = Utility.connectRpc(network);
      const owner = await Utility.nft.getNftOwner(connection, new PublicKey(tokenAddress));
      return owner;
    } catch (error) {
      throw error;
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
      throw error;
    }
  }

  async fetchNft(fetchNftDto: FetchNftDto): Promise<NftData> {
    try {
      const { network, tokenAddress } = fetchNftDto;
      const connection = Utility.connectRpc(network);
      if (!tokenAddress) {
        throw new HttpException('Please provide any public or private key', HttpStatus.BAD_REQUEST);
      }
      const accInfo = <any>await connection.getParsedAccountInfo(new PublicKey(tokenAddress));
      const supply = parseInt(accInfo?.value?.data?.parsed?.info?.supply);

      if (supply) {
        const metaplex = new Metaplex(connection);
        const nft = (await metaplex.nfts().findByMint(new PublicKey(tokenAddress)).run()) as Nft;
        const metadata = Utility.nft.nftToMetadataTypeCast(nft);
        let uriRes = {};

        try {
          uriRes = await Utility.request(metadata.uri);
        } catch (error) {
          console.log(error?.message);
        }

        if (!metadata) {
          throw new HttpException('No metadata account found', HttpStatus.NOT_FOUND);
        }

        return new NftData(metadata, uriRes);
      } else {
        //0 supply for the NFT, trigger a delete from DB just in case
        const delEvent = new NftDeleteEvent(fetchNftDto.tokenAddress, fetchNftDto.network);
        this.eventEmitter.emit('nft.deleted', delEvent);
      }

      throw newProgramError(
        'NFt_not_found_error',
        HttpStatus.NOT_FOUND,
        `NFT ${tokenAddress} not found on ${network}`,
        '',
        'data-fetcher.fetchNft',
        {
          nft_address: fetchNftDto.tokenAddress,
          network: fetchNftDto.network,
        },
      );
    } catch (error) {
      throw newProgramErrorFrom(error);
    }
  }

  async fetchAllNftsByCreator(fetchAllNftByCreatorDto: FetchAllNftByCreatorDto): Promise<PaginatedNftsResponse> {
    try {
      const { network, creator, page, size } = fetchAllNftByCreatorDto;
      const connection = Utility.connectRpc(network);
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
      const accountPublicKeys = rawMetadatas.map((account) => account.pubkey);
      const pageResults = await this.getPage(connection, accountPublicKeys, page, size);
      const results: NftData[] = [];
      // Run all offchain requests parallely instead of one by one
      const promises: Promise<NftData>[] = [];
      for (const oncd of pageResults) {
        try {
          const onChainData = this.deserializeMetadata(oncd);
          const owner = await this.fetchOwner({
            network,
            tokenAddress: onChainData.mintAddress.toBase58(),
          });

          if (owner !== 'None') {
            promises.push(Utility.request(onChainData.uri));
            results.push(new NftData(onChainData, null, owner));
          }
        } catch (error) {
          //Ignore off chain data that cant be fetched or is taking too long.
          console.log('ignoring');
        }
      }

      const res = await Promise.allSettled(promises);

      res?.forEach((data, i) => {
        results[i].offChainMetadata = data.status === 'fulfilled' ? data.value : {};
      });
      return { nfts: results, total: results.length };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
