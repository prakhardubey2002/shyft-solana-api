import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

import { ReadNftDto } from './dto/read-nft.dto';
import { ReadAllNftDto } from './dto/read-all-nft.dto';
import { HttpService } from '@nestjs/axios';
import { nftHelper } from '../../nft.helper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NftReadEvent, NftReadInWalletEvent } from '../db-sync/events';

@Injectable()
export class ReadNftService {

  constructor(private httpService: HttpService, private eventEmitter: EventEmitter2) { }
  async readAllNfts(readAllNftDto: ReadAllNftDto): Promise<any> {
    try {
      const { network, address } = readAllNftDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      if (!address) {
        throw new HttpException(
          'Please provide any public or private key',
          HttpStatus.BAD_REQUEST,
        );
      }
      const nftsmetadata = await Metadata.findDataByOwner(connection, address);
      let nftReadInWalletEvent = new NftReadInWalletEvent(address)
      this.eventEmitter.emit('nfts.in.wallet', nftReadInWalletEvent)

      return nftsmetadata;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async readNft(readNftDto: ReadNftDto): Promise<any> {
    try {
      const { network, token_address } = readNftDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      if (!token_address) {
        throw new HttpException(
          'Please provide any public or private key',
          HttpStatus.BAD_REQUEST,
        );
      }
      const pda = await Metadata.getPDA(new PublicKey(token_address));
      const metadata = await Metadata.load(connection, pda);
      console.log(metadata);
      const uriRes = await this.httpService.get(metadata.data.data.uri).toPromise();
      if (uriRes.status != 200) {
        throw new HttpException("Incorrect URI path", HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (!metadata) {
        throw new HttpException("Maybe you've lost", HttpStatus.NOT_FOUND);
      }
      const body = nftHelper.parseMetadata(uriRes.data);
      console.log(body)

      let nftReadEvent = new NftReadEvent(token_address)
      this.eventEmitter.emit('nfts.read', nftReadEvent)

      return body;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
