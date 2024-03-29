import { Injectable } from '@nestjs/common';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { NodeWallet } from '@metaplex/js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NftCreationEvent } from 'src/modules/data-cache/db-sync/db.events';
import { ObjectId } from 'mongoose';
import { AccountUtils } from 'src/common/utils/account-utils';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV2Instruction,
  DataV2,
} from '@metaplex-foundation/mpl-token-metadata';
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
  ProgramError,
} from '@metaplex-foundation/js';
import { Utility, ServiceCharge } from 'src/common/utils/utils';
import { newProgramErrorFrom } from 'src/core/program-error';

export interface CreateParams {
  network: WalletAdapterNetwork;
  name: string;
  symbol: string;
  privateKey: string;
  metadataUri: string;
  maxSupply: number;
  royalty: number;
  userId: ObjectId;
  nftReceiver?: string;
  serviceCharge?: ServiceCharge;
}

@Injectable()
export class CreateNftService {
  constructor(private eventEmitter: EventEmitter2) {}

  async createMasterNft(createParams: CreateParams): Promise<unknown> {
    const { name, symbol, metadataUri, royalty, maxSupply, network, privateKey, nftReceiver, serviceCharge } =
      createParams;
    if (!metadataUri) {
      throw new Error('No metadata URI');
    }
    try {
      const connection = Utility.connectRpc(network);
      const feePayer = AccountUtils.getKeypair(privateKey);
      const wallet = new NodeWallet(feePayer);
      const receiverPubKey = nftReceiver ? new PublicKey(nftReceiver) : wallet.publicKey;
      const mintRent = await getMinimumBalanceForRentExemptMint(connection);
      const mintKeypair = Keypair.generate();

      const metadataPda = findMetadataPda(mintKeypair.publicKey);
      const masterEditionPda = findMasterEditionV2Pda(mintKeypair.publicKey);

      const associatedToken = findAssociatedTokenAccountPda(
        mintKeypair.publicKey,
        receiverPubKey,
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
            address: feePayer.publicKey,
            verified: true,
            share: 100,
          },
        ],
        collection: null,
        uses: null,
      } as DataV2;

      let tx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: feePayer.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          0,
          feePayer.publicKey,
          feePayer.publicKey,
          TOKEN_PROGRAM_ID,
        ),
        createAssociatedTokenAccountInstruction(
          feePayer.publicKey,
          associatedToken,
          receiverPubKey,
          mintKeypair.publicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
        createMintToInstruction(mintKeypair.publicKey, associatedToken, feePayer.publicKey, 1),
        createCreateMetadataAccountV2Instruction(
          {
            metadata: metadataPda,
            mint: mintKeypair.publicKey,
            mintAuthority: feePayer.publicKey,
            payer: feePayer.publicKey,
            updateAuthority: feePayer.publicKey,
          },
          {
            createMetadataAccountArgsV2: { data: nftMetadata, isMutable: true },
          },
        ),
        createCreateMasterEditionV3Instruction(
          {
            edition: masterEditionPda,
            mint: mintKeypair.publicKey,
            updateAuthority: feePayer.publicKey,
            mintAuthority: feePayer.publicKey,
            payer: feePayer.publicKey,
            metadata: metadataPda,
          },
          { createMasterEditionArgs: { maxSupply } },
        ),
      );

      if (serviceCharge) {
        tx = await Utility.account.addSeviceChargeOnTransaction(connection, tx, serviceCharge, feePayer.publicKey);
      }

      const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
      tx.feePayer = feePayer.publicKey;
      tx.recentBlockhash = blockHash;
      tx.partialSign(mintKeypair);

      const signedTx = await wallet.signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize());

      const nftCreationEvent = new NftCreationEvent(
        mintKeypair.publicKey.toBase58(),
        createParams.network,
        createParams.userId,
      );
      this.eventEmitter.emit('nft.created', nftCreationEvent);
      return {
        txId,
        mint: mintKeypair.publicKey.toBase58(),
        metadata: metadataPda.toBase58(),
        edition: masterEditionPda.toBase58(),
      };
    } catch (error) {
      if (error instanceof ProgramError) {
        throw error;
      } else {
        throw newProgramErrorFrom(error, 'create_nft_error');
      }
    }
  }
}
