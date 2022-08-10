import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  clusterApiUrl,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ObjectId } from 'mongoose';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { findAssociatedTokenAccountPda, findMasterEditionV2Pda, findMetadataPda } from '@metaplex-foundation/js';
import { createCreateMasterEditionV3Instruction, createCreateMetadataAccountV2Instruction, DataV2 } from '@metaplex-foundation/mpl-token-metadata';
export interface CreateParams {
  network: WalletAdapterNetwork;
  name: string;
  symbol: string;
  address: string;
  metadataUri: string;
  maxSupply: number;
  royalty: number;
  userId: ObjectId;
}

@Injectable()
export class CreateNftDetachService {
  async mintNft(createParams: CreateParams): Promise<unknown> {
    const { name, symbol, metadataUri, maxSupply, royalty, network, address } =
      createParams;
    if (!metadataUri) {
      throw new Error('No metadata URI');
    }
    try {
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      const mintRent = await getMinimumBalanceForRentExemptMint(connection);
      const mintKeypair = Keypair.generate();

      const metadataPda = findMetadataPda(mintKeypair.publicKey);
      const masterEditionPda = findMasterEditionV2Pda(mintKeypair.publicKey);

      const addressPubKey = new PublicKey(address);
      const associatedToken = findAssociatedTokenAccountPda(
        mintKeypair.publicKey,
        addressPubKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const nftMetadata = {
        name,
        symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: royalty,
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

      const tx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: addressPubKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          0,
          addressPubKey,
          addressPubKey,
          TOKEN_PROGRAM_ID,
        ),
        createAssociatedTokenAccountInstruction(
          addressPubKey,
          associatedToken,
          addressPubKey,
          mintKeypair.publicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedToken,
          addressPubKey,
          1,
        ),
        createCreateMetadataAccountV2Instruction(
          {
            metadata: metadataPda,
            mint: mintKeypair.publicKey,
            mintAuthority: addressPubKey,
            payer: addressPubKey,
            updateAuthority: addressPubKey,
          },
          {
            createMetadataAccountArgsV2: { data: nftMetadata, isMutable: true },
          },
        ),
        createCreateMasterEditionV3Instruction(
          {
            edition: masterEditionPda,
            mint: mintKeypair.publicKey,
            updateAuthority: addressPubKey,
            mintAuthority: addressPubKey,
            payer: addressPubKey,
            metadata: metadataPda,
          },
          { createMasterEditionArgs: { maxSupply } },
        ),
      );

      const blockHash = (await connection.getLatestBlockhash('finalized'))
        .blockhash;
      tx.feePayer = addressPubKey;
      tx.recentBlockhash = blockHash;
      tx.partialSign(mintKeypair);
      const serializedTransaction = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const transactionBase64 = serializedTransaction.toString('base64');

      return { encoded_transaction: transactionBase64, mint: mintKeypair.publicKey.toBase58() };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
