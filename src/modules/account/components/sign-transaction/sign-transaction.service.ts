import { NodeWallet } from '@metaplex/js';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl, Keypair, Transaction } from '@solana/web3.js';
import { decode } from 'bs58';
import { Connection } from '@solana/web3.js';

import { SignTransactionDto } from './dto/sign-transaction.dto';
import { newProgramErrorFrom } from 'src/core/program-error';

@Injectable()
export class SignTransactionService {
  async signTransaction(signTransactionDto: SignTransactionDto): Promise<any> {
    try {
      const { network, private_key, encoded_transaction } = signTransactionDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      const feePayer = Keypair.fromSecretKey(decode(private_key));
      const wallet = new NodeWallet(feePayer);
      const recoveredTransaction = Transaction.from(Buffer.from(encoded_transaction, 'base64'));
      const signedTx = await wallet.signTransaction(recoveredTransaction);
      const confirmTransaction = await connection.sendRawTransaction(
        signedTx.serialize(),
      );
      return confirmTransaction;
    } catch (error) {
      console.log(error);
      throw newProgramErrorFrom(error, "sign_transaction_error");
    }
  }
}
