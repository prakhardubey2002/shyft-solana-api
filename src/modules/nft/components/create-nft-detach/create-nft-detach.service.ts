import { Injectable } from '@nestjs/common';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
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
import {
  findAssociatedTokenAccountPda,
  findMasterEditionV2Pda,
  findMetadataPda,
} from '@metaplex-foundation/js';
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV2Instruction,
  DataV2,
} from '@metaplex-foundation/mpl-token-metadata';
import { Utility, ServiceCharge } from 'src/common/utils/utils';
import { newProgramErrorFrom, ProgramError } from 'src/core/program-error';

import { NftCreationEvent } from 'src/modules/data-cache/db-sync/db.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface CreateParams {
  network: WalletAdapterNetwork;
  name: string;
  symbol: string;
  address: string;
  metadataUri: string;
  maxSupply: number;
  royalty: number;
  userId: ObjectId;
  serviceCharge: ServiceCharge;
}

@Injectable()
export class CreateNftDetachService {
  constructor(private eventEmitter: EventEmitter2) {}
  async createMasterNft(createParams: CreateParams): Promise<unknown> {
    const {
      name,
      symbol,
      metadataUri,
      maxSupply,
      royalty,
      network,
      address,
      serviceCharge,
    } = createParams;
    if (!metadataUri) {
      throw new Error('No metadata URI');
    }
    try {
      const connection = Utility.connectRpc(network);
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

      let tx = new Transaction().add(
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

      if (serviceCharge) {
        tx = await Utility.account.addSeviceChargeOnTransaction(
          connection,
          tx,
          serviceCharge,
          addressPubKey,
        );
      }

      const blockHash = (await connection.getLatestBlockhash('finalized'))
        .blockhash;
      tx.feePayer = addressPubKey;
      tx.recentBlockhash = blockHash;
      tx.partialSign(mintKeypair);
      const serializedTransaction = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const transactionBase64 = serializedTransaction.toString('base64');

      const nftCreatedEvent = new NftCreationEvent(
        mintKeypair.publicKey.toBase58(),
        network,
        createParams.userId,
      );
      this.eventEmitter.emit('nft.created', nftCreatedEvent);

      return {
        encoded_transaction: transactionBase64,
        mint: mintKeypair.publicKey.toBase58(),
      };
    } catch (error) {
      if (error instanceof ProgramError) {
        throw error;
      } else {
        throw newProgramErrorFrom(error, 'create_nft_detach_error');
      }
    }
  }
}
