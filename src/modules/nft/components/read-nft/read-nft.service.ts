import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

import { ReadNftDto } from './dto/read-nft.dto';
import { AccountService } from 'src/modules/account/account.service';

@Injectable()
export class ReadNftService {
  constructor(private accountService: AccountService) {}
  async readNft(readNftDto: ReadNftDto): Promise<any> {
    try {
      const { privateKey, network, publicKey } = readNftDto;
      let address: string;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      if (privateKey) {
        const accountInfo = await this.accountService.getKeypair(privateKey);
        address = accountInfo.publicKey.toBase58();
      }
      if (publicKey) {
        address = publicKey;
      }
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
}
