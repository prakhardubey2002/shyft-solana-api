import { Injectable } from '@nestjs/common';
import { clusterApiUrl } from '@solana/web3.js';

import { actions, Connection, NodeWallet } from '@metaplex/js';
import { CreateNftDto } from './dto/create-nft.dto';
import { AccountService } from 'src/modules/account/account.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NftCreationEvent } from '../db-sync/events';

@Injectable()
export class CreateNftService {
  constructor(private accountService: AccountService, private eventEmitter: EventEmitter2) { }
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

    let nftCreationEvent = new NftCreationEvent(nft.mint.toString())
    this.eventEmitter.emit('nft.created', nftCreationEvent)

    return nft;
  }
}
