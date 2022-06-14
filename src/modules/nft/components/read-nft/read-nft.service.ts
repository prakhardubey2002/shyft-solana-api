import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

import { ReadNftDto } from './dto/read-nft.dto';
import { ReadAllNftDto } from './dto/read-all-nft.dto';

@Injectable()
export class ReadNftService {
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
      const metadata = await Metadata.getEdition(
        connection,
        new PublicKey(token_address),
      );
      if (!metadata) {
        throw new HttpException("Maybe you've lost", HttpStatus.NOT_FOUND);
      }

      return metadata;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
