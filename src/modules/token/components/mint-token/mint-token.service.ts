import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getMint, getAssociatedTokenAddress, createMintToCheckedInstruction, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintToChecked } from '@solana/spl-token';
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { AccountUtils } from 'src/common/utils/account-utils';
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
      } = mintTokenDto;

      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      const feePayer = AccountUtils.getKeypair(private_key);

      const tokenAddressPubkey = new PublicKey(token_address);
      const tokenInfo = await getMint(connection, tokenAddressPubkey);

      if (tokenInfo.isInitialized) {
        if (tokenInfo.mintAuthority.toBase58() !== feePayer.publicKey.toBase58()) {
          throw Error('You dont have the authority to mint these tokens');
        }
        //Get or Create an associated token address for receiver.
        const tokenAccountOwner = await getOrCreateAssociatedTokenAccount(
          connection,
          feePayer,
          new PublicKey(token_address),
          new PublicKey(receiver),
        );

        const decimalAmount = Math.pow(10, tokenInfo.decimals);

        const txhash = await mintToChecked(
          connection, // connection
          feePayer, // fee payer
          tokenAddressPubkey, // mint
          tokenAccountOwner.address, // receiver (sholud be a token account)
          feePayer, // mint authority
          decimalAmount * amount,
          tokenInfo.decimals, // decimals
        );

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
        address,
        token_address: token_address,
        amount,
      } = mintTokenDetachDto;

      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      const tokenAddressPubkey = new PublicKey(token_address);
      const tokenInfo = await getMint(connection, tokenAddressPubkey);
      const addressPubkey = new PublicKey(address);

      if (tokenInfo.isInitialized) {
        if (tokenInfo.mintAuthority.toBase58() !== address) {
          throw Error('You dont have the authority to mint these tokens');
        }
        const associatedTokenAddress = await getAssociatedTokenAddress(
          tokenAddressPubkey,
          addressPubkey,
        );
        const decimalAmount = Math.pow(10, tokenInfo.decimals);

        const tx = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            addressPubkey,
            associatedTokenAddress,
            addressPubkey,
            tokenAddressPubkey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
          ),
          createMintToCheckedInstruction(
            tokenAddressPubkey, // mint
            associatedTokenAddress, // destination
            addressPubkey, // authority
            decimalAmount * amount, // amount
            tokenInfo.decimals, // decimals
          ),
        );

        const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
        tx.recentBlockhash = blockHash;
        tx.feePayer = addressPubkey;

        const serializedTransaction = tx.serialize({ requireAllSignatures: false });
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
