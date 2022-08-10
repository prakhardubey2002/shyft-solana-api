import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  burnChecked,
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { BurnTokenDto, BurnTokenDetachDto } from './dto/burn-token.dto';
import { AccountUtils } from 'src/common/utils/account-utils';

@Injectable()
export class BurnTokenService {
  async burnToken(burnTokenDto: BurnTokenDto): Promise<any> {
    try {
      const { network, private_key, token_address, amount } = burnTokenDto;

      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      const feePayer = AccountUtils.getKeypair(private_key);

      const tokenAddressPubkey = new PublicKey(token_address);

      const tokenInfo = await getMint(connection, tokenAddressPubkey);

      try {
        const tokenAccountOwner = await PublicKey.findProgramAddress(
          [
            feePayer.publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenAddressPubkey.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID,
        );

        const decimalAmt = Math.pow(10, tokenInfo.decimals);

        const txhash = await burnChecked(
          connection,
          feePayer,
          tokenAccountOwner[0],
          tokenAddressPubkey,
          feePayer,
          decimalAmt * amount,
          tokenInfo.decimals,
        );
        return { txhash };
      } catch (error) {
        throw error;
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async burnTokenDetach(burnTokenDetachDto: BurnTokenDetachDto): Promise<any> {
    try {
      const { network, wallet, token_address, amount } = burnTokenDetachDto;

      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      const addressPubkey = new PublicKey(wallet);

      const tokenAddressPubkey = new PublicKey(token_address);

      const associatedTokenAddress = await getAssociatedTokenAddress(
        tokenAddressPubkey,
        addressPubkey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const tokenInfo = await getMint(connection, tokenAddressPubkey);

      const decimalAmt = Math.pow(10, tokenInfo.decimals);

      const tx = new Transaction().add(
        createBurnCheckedInstruction(
          associatedTokenAddress, // token account
          tokenAddressPubkey, // mint
          addressPubkey, // owner of token account
          decimalAmt * amount, // amount,
          tokenInfo.decimals, // decimals
        ),
      );

      const blockHash = (await connection.getLatestBlockhash('finalized'))
        .blockhash;
      tx.feePayer = addressPubkey;
      tx.recentBlockhash = blockHash;

      const serializedTransaction = tx.serialize({ requireAllSignatures: false });
      const transactionBase64 = serializedTransaction.toString('base64');

      return transactionBase64;
    } catch (err) {
      console.error(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
