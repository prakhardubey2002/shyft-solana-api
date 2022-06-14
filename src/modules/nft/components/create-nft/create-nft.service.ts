import { Injectable } from '@nestjs/common';
import { clusterApiUrl } from '@solana/web3.js';

import { actions, Connection, NodeWallet } from '@metaplex/js';
import { CreateNftDto } from './dto/create-nft.dto';
import { AccountService } from 'src/modules/account/account.service';

@Injectable()
export class CreateNftService {
  constructor(private accountService: AccountService) {}
  async mintNft(createNftDto: CreateNftDto): Promise<any> {
    const { metadata_uri, maxSupply } = createNftDto;
    if (!metadata_uri) {
      throw new Error('No metadata URI');
    }
    const { network, private_key } = createNftDto;
    const connection = new Connection(clusterApiUrl(network), 'confirmed');
    const from = this.accountService.getKeypair(private_key);
    const wallet = new NodeWallet(from);
    const nft = await actions.mintNFT({
      connection,
      wallet,
      uri: metadata_uri,
      maxSupply: maxSupply || 1,
    });
    return nft;
  }
}
