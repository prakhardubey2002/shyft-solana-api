import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { Metadata, MetadataData } from '@metaplex-foundation/mpl-token-metadata';
import { HttpService } from '@nestjs/axios';
import { nftHelper } from '../../nft.helper';
import { NftReadEvent, NftReadInWalletEvent } from '../db-sync/events';
import { FetchNftDto, FetchAllNftDto } from './dto/data-fetcher.dto';

@Injectable()
export class RemoteDataFetcherService {

    constructor(private httpService: HttpService) { }
    async fetchAllNfts(fetchAllNftDto: FetchAllNftDto): Promise<MetadataData[]> {
        try {
            const { network, walletAddress } = fetchAllNftDto;
            const connection = new Connection(clusterApiUrl(network), 'confirmed');
            if (!walletAddress) {
                throw new HttpException(
                    'Please provide any public or private key',
                    HttpStatus.BAD_REQUEST,
                );
            }
            const nftsmetadata = await Metadata.findDataByOwner(connection, walletAddress);
            return nftsmetadata;
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async fetchNft(fetchNftDto: FetchNftDto): Promise<any> {
        try {
            const { network, tokenAddress } = fetchNftDto;
            const connection = new Connection(clusterApiUrl(network), 'confirmed');
            if (!tokenAddress) {
                throw new HttpException(
                    'Please provide any public or private key',
                    HttpStatus.BAD_REQUEST,
                );
            }
            const pda = await Metadata.getPDA(new PublicKey(tokenAddress));
            const metadata = await Metadata.load(connection, pda);
            //console.log(metadata);
            const uriRes = await this.httpService.get(metadata.data.data.uri).toPromise();
            if (uriRes.status != 200) {
                throw new HttpException("Incorrect URI path", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            if (!metadata) {
                throw new HttpException("Maybe you've lost", HttpStatus.NOT_FOUND);
            }

            //const body = nftHelper.parseMetadata(uriRes.data);
            //console.log(body)
            let retObj = {
                onChainMetadata: metadata,
                offChainMetadata: uriRes.data
            }

            return retObj;
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, error.status);
        }
    }
}
