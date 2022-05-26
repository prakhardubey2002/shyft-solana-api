import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bs58 from 'bs58';
import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { BalanceCheckDto } from './dto/balance-check.dto';
import { SendSolDto } from './dto/send-sol.dto';

@Injectable()
export class AccountService {
  getKeypair(privateKey: string): any {
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    return keypair;
  }

  async checkBalance(balanceCheckDto: BalanceCheckDto): Promise<number> {
    try {
      const { privateKey, network } = balanceCheckDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      const keypair = this.getKeypair(privateKey);
      const balance = await connection.getBalance(keypair.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async sendSol(sendSolDto: SendSolDto): Promise<string> {
    try {
      const { network, privateKey, recipientPublicKey, amount } = sendSolDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');

      const from = this.getKeypair(privateKey);
      const to = bs58.decode(recipientPublicKey);
      // Add transfer instruction to transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: new PublicKey(to),
          lamports: LAMPORTS_PER_SOL * amount,
        }),
      );

      // Sign transaction, broadcast, and confirm
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from],
      );
      return signature;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
