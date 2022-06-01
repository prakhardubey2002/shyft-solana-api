import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

import { ReadNftDto } from './dto/read-nft.dto';

@Injectable()
export class ReadNftService {
  constructor() {}

  async readAllNfts(readAllNftDto: ReadNftDto): Promise<any> {
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
      const { network, address } = readNftDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      if (!address) {
        throw new HttpException(
          'Please provide any public or private key',
          HttpStatus.BAD_REQUEST,
        );
      }
      const metadata = await Metadata.getEdition(connection, address);
      return metadata;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
