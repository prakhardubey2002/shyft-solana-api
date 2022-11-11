import { NodeWallet } from '@metaplex/js';
import { Injectable } from '@nestjs/common';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { decode } from 'bs58';

import { SignAllTransactionsDto, SignTransactionDto } from './dto/sign-transaction.dto';
import { newProgramErrorFrom } from 'src/core/program-error';
import { Utility } from 'src/common/utils/utils';
import { publicKey } from '@project-serum/anchor/dist/cjs/utils';

@Injectable()
export class SignTransactionService {
  async signTransaction(signTransactionDto: SignTransactionDto): Promise<any> {
    try {
      const { network, private_keys, encoded_transaction } = signTransactionDto;
      const connection = Utility.connectRpc(network);
      const keys = private_keys.map((k) => {
        return Keypair.fromSecretKey(decode(k));
      });
      const recoveredTransaction = Transaction.from(Buffer.from(encoded_transaction, 'base64'));
      recoveredTransaction.partialSign(...keys);
      const confirmTransaction = await connection.sendRawTransaction(recoveredTransaction.serialize());
      return confirmTransaction;
    } catch (error) {
      console.log(error);
      throw newProgramErrorFrom(error, 'sign_transaction_error');
    }
  }

  async signAllTransactions(signAllTransactionsDto: SignAllTransactionsDto): Promise<any> {
    try {
      const { network, private_keys: privateKeys, encoded_transactions: encodedTransactions } = signAllTransactionsDto;
      const connection = Utility.connectRpc(network);
      const keyMap = new Map<string, Keypair>();
      privateKeys.forEach((k) => {
        const keyPair = Keypair.fromSecretKey(decode(k));
        keyMap.set(keyPair.publicKey.toBase58(), keyPair);
      });
      const recoveredTransactions = encodedTransactions.map((encodedTransaction) =>
        Transaction.from(Buffer.from(encodedTransaction, 'base64')),
      );
      const confirmTransaction: string[] = [];
      for await (const tx of recoveredTransactions) {
        const privateKeys = tx.signatures.map((signer) => {
          return keyMap.get(signer.publicKey.toBase58());
        });
        tx.partialSign(...privateKeys);
        const completedTx = await connection.sendRawTransaction(tx.serialize());
        confirmTransaction.push(completedTx);
      }
      return confirmTransaction;
    } catch (error) {
      console.log(error);
      throw newProgramErrorFrom(error, 'sign_all_transactions_error');
    }
  }
}
