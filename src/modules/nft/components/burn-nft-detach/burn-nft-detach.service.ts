import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { createBurnCheckedInstruction, createCloseAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { BurnNftDetachDto } from './dto/burn-nft-detach.dto';

@Injectable()
export class BurnNftDetachService {
  async burnNft(burnNftDetachDto: BurnNftDetachDto): Promise<any> {
    try {
      const { network, wallet, token_address, close } = burnNftDetachDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
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

      return transactionBase64;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}