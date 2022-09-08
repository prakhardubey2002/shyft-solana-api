import { NodeWallet } from '@metaplex/js';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  getMint,
  createMintToCheckedInstruction,
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
} from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';
import { AccountUtils } from 'src/common/utils/account-utils';
import { Utility } from 'src/common/utils/utils';
import { MintTokenDto, MintTokenDetachDto } from './dto/mint-token.dto';

@Injectable()
export class MintTokenService {
  async mintToken(mintTokenDto: MintTokenDto): Promise<any> {
    try {
      const {
        network,
        private_key,
        token_address: token_address,
        amount,
        receiver,
        message,
      } = mintTokenDto;

      const connection = Utility.connectRpc(network);
      const feePayer = AccountUtils.getKeypair(private_key);
      const receiverPubKey = new PublicKey(receiver);
      const tokenAddressPubkey = new PublicKey(token_address);
      const tokenInfo = await getMint(connection, tokenAddressPubkey);

      if (tokenInfo.isInitialized) {
        if (
          tokenInfo.mintAuthority.toBase58() !== feePayer.publicKey.toBase58()
        ) {
          throw Error('You dont have the authority to mint these tokens');
        }
        const { associatedAccountAddress, createTx } =
          await Utility.account.getOrCreateAsscociatedAccountTx(
            connection,
            feePayer.publicKey,
            tokenAddressPubkey,
            receiverPubKey,
          );

        const decimalAmount = Math.pow(10, tokenInfo.decimals);

        const tx: Transaction = new Transaction();
        if (createTx) {
          tx.add(createTx);
        }
        tx.add(
          createMintToCheckedInstruction(
            tokenAddressPubkey, // mint
            associatedAccountAddress, // destination
            feePayer.publicKey, // authority
            decimalAmount * amount, // amount
            tokenInfo.decimals, // decimals
          ),
        );

        if (message) {
          tx.add(Utility.transaction.getMemoTx(feePayer.publicKey, message));
        }

        const blockHash = (await connection.getLatestBlockhash('finalized'))
          .blockhash;
        tx.recentBlockhash = blockHash;
        tx.feePayer = feePayer.publicKey;
        const wallet = new NodeWallet(feePayer);
        const signedTx = await wallet.signTransaction(tx);
        const txhash = await connection.sendRawTransaction(signedTx.serialize());

        return { txhash };
      } else {
        throw Error('Token not initialized');
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async mintTokenDetach(mintTokenDetachDto: MintTokenDetachDto): Promise<any> {
    try {
      const {
        network,
        wallet,
        receiver,
        token_address: token_address,
        amount,
        message,
      } = mintTokenDetachDto;

      const connection = Utility.connectRpc(network);
      const tokenAddressPubkey = new PublicKey(token_address);
      const tokenInfo = await getMint(connection, tokenAddressPubkey);
      const addressPubkey = new PublicKey(wallet);
      const receiverPubkey = new PublicKey(receiver);

      if (tokenInfo.isInitialized) {
        if (tokenInfo.mintAuthority.toBase58() !== wallet) {
          throw Error('You dont have the authority to mint these tokens');
        }
        const { associatedAccountAddress, createTx } =
          await Utility.account.getOrCreateAsscociatedAccountTx(
            connection,
            addressPubkey,
            tokenAddressPubkey,
            receiverPubkey,
          );

        const decimalAmount = Math.pow(10, tokenInfo.decimals);

        const tx: Transaction = new Transaction();
        if (createTx) {
          tx.add(createTx);
        }
        tx.add(
          createMintToCheckedInstruction(
            tokenAddressPubkey, // mint
            associatedAccountAddress, // destination
            addressPubkey, // authority
            decimalAmount * amount, // amount
            tokenInfo.decimals, // decimals
          ),
        );

        if (message) {
          tx.add(Utility.transaction.getMemoTx(addressPubkey, message));
        }

        const blockHash = (await connection.getLatestBlockhash('finalized'))
          .blockhash;
        tx.recentBlockhash = blockHash;
        tx.feePayer = addressPubkey;

        const serializedTransaction = tx.serialize({
          requireAllSignatures: false,
        });
        const transactionBase64 = serializedTransaction.toString('base64');

        return { encoded_transaction: transactionBase64, mint: token_address };
      } else {
        throw Error('Token not initialized');
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
