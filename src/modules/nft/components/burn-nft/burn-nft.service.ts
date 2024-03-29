import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { actions, NodeWallet } from '@metaplex/js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { AccountUtils } from 'src/common/utils/account-utils';
import { BurnNftDto } from './dto/burn-nft.dto';
import { NftDeleteEvent } from '../../../data-cache/db-sync/db.events';
import { Utility } from 'src/common/utils/utils';

@Injectable()
export class BurnNftService {
  constructor(private eventEmitter: EventEmitter2) {}
  async burnNft(burnNftDto: BurnNftDto): Promise<any> {
    try {
      const { network, private_key, token_address, close, amount } = burnNftDto;
      const connection = Utility.connectRpc(burnNftDto.network);
      const keypair = AccountUtils.getKeypair(private_key);
      const wallet = new NodeWallet(keypair);

      const associatedAddress = await getAssociatedTokenAddress(new PublicKey(token_address), keypair.publicKey);

      const result = await actions.burnToken({
        connection,
        wallet,
        token: associatedAddress,
        mint: new PublicKey(token_address),
        amount: amount || 1,
        owner: keypair.publicKey,
        close: close,
      });

      const nftDeleteEvent = new NftDeleteEvent(token_address, network);
      this.eventEmitter.emit('nft.deleted', nftDeleteEvent);

      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
