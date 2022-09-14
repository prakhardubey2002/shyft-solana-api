import { NodeWallet } from '@metaplex/js';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  getOrCreateAssociatedTokenAccount,
  getMint,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';
import { AccountUtils } from 'src/common/utils/account-utils';
import { Utility } from 'src/common/utils/utils';
import { newProgramErrorFrom, ProgramError } from 'src/core/program-error';
import { TransferTokenDto, TransferTokenDetachDto } from './dto/transfer-token.dto';

@Injectable()
export class TransferTokenService {
  async transferToken(transferTokenDto: TransferTokenDto): Promise<any> {
    try {
      const {
        network,
        from_address,
        token_address: token_address,
        amount,
        to_address,
      } = transferTokenDto;

      const connection = Utility.connectRpc(network);
      const fromKeypair = AccountUtils.getKeypair(from_address);

      const tokenAddressPubkey = new PublicKey(token_address);
      const tokenInfo = await getMint(connection, tokenAddressPubkey);

      if (tokenInfo.isInitialized) {
        //Get or Create an associated token address for receiver.
        const fromAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          fromKeypair,
          new PublicKey(token_address),
          fromKeypair.publicKey,
        );

        const toAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          fromKeypair,
          new PublicKey(token_address),
          new PublicKey(to_address),
        );

        const amtToTransfer = Math.pow(10, tokenInfo.decimals) * amount;
        const wallet = new NodeWallet(fromKeypair);

        const ix = createTransferCheckedInstruction(
          fromAccount.address,
          new PublicKey(token_address),
          toAccount.address,
          fromKeypair.publicKey,
          amtToTransfer,
          tokenInfo.decimals,
        );

        const tx = new Transaction().add(ix);
        tx.feePayer = fromKeypair.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
        const signedTx = await wallet.signTransaction(tx);
        const txId = await connection.sendRawTransaction(signedTx.serialize());
        return { txId };
      } else {
        throw Error('Token not initialized');
      }
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async transferTokenDetach(transferTokenDetachDto: TransferTokenDetachDto): Promise<any> {
    try {
      const {
        network,
        from_address,
        token_address: token_address,
        amount,
        to_address,
      } = transferTokenDetachDto;

      const connection = Utility.connectRpc(network);
      const fromAddressPubKey = new PublicKey(from_address);
      const toAddressPubKey = new PublicKey(to_address);

      const tokenAddressPubKey = new PublicKey(token_address);
      let tx = new Transaction();
      tx = await Utility.token.transferTokenTransaction(connection, tx, tokenAddressPubKey, amount, toAddressPubKey, fromAddressPubKey);
      tx.feePayer = fromAddressPubKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      const serializedTransaction = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const transactionBase64 = serializedTransaction.toString('base64');

      return { encoded_transaction: transactionBase64 };
    } catch (err) {
      if (err instanceof ProgramError) {
        throw err;
      } else {
        throw newProgramErrorFrom(err, 'transfer_token_error');
      }
    }
  }
}
