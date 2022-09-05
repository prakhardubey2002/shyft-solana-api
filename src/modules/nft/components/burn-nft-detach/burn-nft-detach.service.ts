import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { BurnNftDetachDto } from './dto/burn-nft-detach.dto';
import { NftDeleteEvent } from '../../../helper/db-sync/db.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Utility } from 'src/common/utils/utils';

@Injectable()
export class BurnNftDetachService {
  constructor(private eventEmitter: EventEmitter2) { }
  async burnNft(burnNftDetachDto: BurnNftDetachDto): Promise<any> {
    try {
      const { network, wallet, token_address, close } = burnNftDetachDto;
      const connection = Utility.connectRpc(burnNftDetachDto.network);
      const addressPubKey = new PublicKey(wallet);
      const associatedTokenAddress = await getAssociatedTokenAddress(
        new PublicKey(token_address),
        addressPubKey,
      );
      const tokenAddressPubKey = new PublicKey(token_address);

      const tx = new Transaction().add(
        createBurnCheckedInstruction(
          associatedTokenAddress, // token account
          tokenAddressPubKey, // mint
          addressPubKey, // owner of token account
          1, // amount,
          0, // decimals
        ),
      );

      if (close) {
        tx.add(
          createCloseAccountInstruction(
            associatedTokenAddress, // token account which you want to close
            addressPubKey, // destination
            addressPubKey, // owner of token account
          ),
        );
      }

      const blockHash = (await connection.getLatestBlockhash('finalized'))
        .blockhash;
      tx.feePayer = addressPubKey;
      tx.recentBlockhash = blockHash;

      const serializedTransaction = tx.serialize({ requireAllSignatures: false });
      const transactionBase64 = serializedTransaction.toString('base64');

      //Trigger a delete event, if it isnt actually deleted, it will be added back on the next read.
      const nftDelEvent = new NftDeleteEvent(token_address, network);
      this.eventEmitter.emit('nft.deleted', nftDelEvent);

      return transactionBase64;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
