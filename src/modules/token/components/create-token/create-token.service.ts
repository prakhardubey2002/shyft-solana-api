import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
} from '@solana/spl-token';
import {
  createCreateMetadataAccountV2Instruction,
  DataV2,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { NodeWallet } from '@metaplex/js';
import { findMetadataPda } from '@metaplex-foundation/js';
import { CreateTokenDto, CreateTokenDetachDto } from './dto/create-token.dto';
import { AccountUtils } from 'src/common/utils/account-utils';
import { Utility } from 'src/common/utils/utils';

@Injectable()
export class CreateTokenService {
  async createToken(createTokenDto: CreateTokenDto, uri: string): Promise<any> {
    try {
      const { network, private_key, name, symbol, decimals } = createTokenDto;

      const connection = Utility.connectRpc(network);
      const feePayer = AccountUtils.getKeypair(private_key);
      const wallet = new NodeWallet(feePayer);

      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      const mintKeypair = Keypair.generate();
      const metadataPDA = findMetadataPda(mintKeypair.publicKey);

      const tokenMetadata = {
        name,
        symbol,
        uri,
        sellerFeeBasisPoints: 0,
        creators: [
          {
            address: feePayer.publicKey,
            verified: true,
            share: 100,
          },
        ],
        collection: null,
        uses: null,
      } as DataV2;

      const createNewTokenTransaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: feePayer.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals ?? 9, // decimals
          feePayer.publicKey,
          feePayer.publicKey,
          TOKEN_PROGRAM_ID,
        ),
        createCreateMetadataAccountV2Instruction(
          {
            metadata: metadataPDA,
            mint: mintKeypair.publicKey,
            mintAuthority: feePayer.publicKey,
            payer: feePayer.publicKey,
            updateAuthority: feePayer.publicKey,
          },
          {
            createMetadataAccountArgsV2: {
              data: tokenMetadata,
              isMutable: true,
            },
          },
        ),
      );

      const blockHash = (await connection.getLatestBlockhash('finalized'))
        .blockhash;
      createNewTokenTransaction.recentBlockhash = blockHash;
      createNewTokenTransaction.feePayer = feePayer.publicKey;
      createNewTokenTransaction.partialSign(mintKeypair);

      const signedTx = await wallet.signTransaction(createNewTokenTransaction);
      const txhash = await connection.sendRawTransaction(signedTx.serialize());

      return { txhash, token_address: mintKeypair.publicKey.toBase58() };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createTokenDetach(
    createTokenDetachDto: CreateTokenDetachDto,
    uri: string,
  ): Promise<any> {
    try {
      const { network, wallet, name, symbol, decimals } = createTokenDetachDto;

      const connection = Utility.connectRpc(network);

      const addressPubKey = new PublicKey(wallet);
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      const mintKeypair = Keypair.generate();

      const metadataPDA = findMetadataPda(mintKeypair.publicKey);

      const tokenMetadata = {
        name,
        symbol,
        uri,
        sellerFeeBasisPoints: 0,
        creators: [
          {
            address: addressPubKey,
            verified: true,
            share: 100,
          },
        ],
        collection: null,
        uses: null,
      } as DataV2;

      const createNewTokenTransaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: addressPubKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals ?? 9, // decimals
          addressPubKey,
          addressPubKey,
          TOKEN_PROGRAM_ID,
        ),
        createCreateMetadataAccountV2Instruction(
          {
            metadata: metadataPDA,
            mint: mintKeypair.publicKey,
            mintAuthority: addressPubKey,
            payer: addressPubKey,
            updateAuthority: addressPubKey,
          },
          {
            createMetadataAccountArgsV2: {
              data: tokenMetadata,
              isMutable: true,
            },
          },
        ),
      );

      const blockHash = (await connection.getLatestBlockhash('finalized'))
        .blockhash;
      createNewTokenTransaction.recentBlockhash = blockHash;
      createNewTokenTransaction.feePayer = addressPubKey;
      createNewTokenTransaction.partialSign(mintKeypair);

      const serializedTransaction = createNewTokenTransaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const transactionBase64 = serializedTransaction.toString('base64');

      return { encoded_transaction: transactionBase64, mint: mintKeypair.publicKey.toBase58() };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
