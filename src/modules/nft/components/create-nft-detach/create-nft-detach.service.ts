import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
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
  Pda,
  toPublicKey,
} from '@metaplex-foundation/js';
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV2Instruction,
  createVerifyCollectionInstruction,
  DataV2,
  MasterEditionV2,
} from '@metaplex-foundation/mpl-token-metadata';
import { Utility, ServiceCharge } from 'src/common/utils/utils';
import { newProgramError, newProgramErrorFrom, ProgramError } from 'src/core/program-error';

import { NftCreationEvent } from 'src/modules/data-cache/db-sync/db.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RemoteDataFetcherService } from 'src/modules/data-cache/remote-data-fetcher/data-fetcher.service';
import { FetchNftDto } from 'src/modules/data-cache/remote-data-fetcher/dto/data-fetcher.dto';

type CollectionAuthorityAndPdas = {
  collectionAuthority: PublicKey;
  collectionMetadataPda: Pda;
  collectionEditionPda: Pda;
};

export interface CreateParams {
  network: WalletAdapterNetwork;
  name: string;
  symbol: string;
  creatorAddress: string;
  collectionAddress?: string;
  metadataUri: string;
  maxSupply: number;
  royalty: number;
  userId: ObjectId;
  nftReceiver?: string;
  serviceCharge?: ServiceCharge;
  feePayer?: string;
}

@Injectable()
export class CreateNftDetachService {
  constructor(private eventEmitter: EventEmitter2, private dataFetcher: RemoteDataFetcherService) {}
  async createMasterNft(createParams: CreateParams): Promise<unknown> {
    const {
      name,
      symbol,
      metadataUri,
      maxSupply,
      royalty,
      network,
      creatorAddress,
      collectionAddress,
      nftReceiver,
      serviceCharge,
      feePayer,
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

      const creatorPubKey = new PublicKey(creatorAddress);
      const receiverPubKey = nftReceiver ? new PublicKey(nftReceiver) : creatorPubKey;
      const txnPayer = feePayer ? new PublicKey(feePayer) : creatorPubKey;
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
            address: creatorPubKey,
            verified: true,
            share: 100,
          },
        ],
        collection: collectionAddress
          ? {
              verified: false,
              key: toPublicKey(createParams?.collectionAddress),
            }
          : null,
        uses: null,
      } as DataV2;

      let tx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: txnPayer,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(mintKeypair.publicKey, 0, creatorPubKey, creatorPubKey, TOKEN_PROGRAM_ID),
        createAssociatedTokenAccountInstruction(
          txnPayer,
          associatedToken,
          receiverPubKey,
          mintKeypair.publicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
        createMintToInstruction(mintKeypair.publicKey, associatedToken, creatorPubKey, 1),
        createCreateMetadataAccountV2Instruction(
          {
            metadata: metadataPda,
            mint: mintKeypair.publicKey,
            mintAuthority: creatorPubKey,
            payer: txnPayer,
            updateAuthority: creatorPubKey,
          },
          {
            createMetadataAccountArgsV2: { data: nftMetadata, isMutable: true },
          },
        ),
        createCreateMasterEditionV3Instruction(
          {
            edition: masterEditionPda,
            mint: mintKeypair.publicKey,
            updateAuthority: creatorPubKey,
            mintAuthority: creatorPubKey,
            payer: txnPayer,
            metadata: metadataPda,
          },
          { createMasterEditionArgs: { maxSupply } },
        ),
      );

      if (collectionAddress) {
        const { collectionAuthority, collectionMetadataPda, collectionEditionPda } =
          await this.getCollectionAuthorityAndPdas(network, connection, collectionAddress);
        tx.add(
          createVerifyCollectionInstruction({
            metadata: metadataPda,
            collectionAuthority,
            payer: txnPayer,
            collectionMint: toPublicKey(collectionAddress),
            collection: collectionMetadataPda,
            collectionMasterEditionAccount: collectionEditionPda,
          }),
        );
      }

      if (serviceCharge) {
        tx = await Utility.account.addSeviceChargeOnTransaction(connection, tx, serviceCharge, txnPayer);
      }

      const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
      tx.feePayer = txnPayer;
      tx.recentBlockhash = blockHash;
      tx.partialSign(mintKeypair);
      const serializedTransaction = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const transactionBase64 = serializedTransaction.toString('base64');

      const nftCreatedEvent = new NftCreationEvent(mintKeypair.publicKey.toBase58(), network, createParams.userId);
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

  async getCollectionAuthorityAndPdas(
    network: WalletAdapterNetwork,
    connection: Connection,
    collectionAddress: string,
  ): Promise<CollectionAuthorityAndPdas> {
    const collectionMint = toPublicKey(collectionAddress);
    const collectionNft = await this.dataFetcher.fetchNft(new FetchNftDto(network, collectionAddress));
    const collectionAuthority = collectionNft.onChainMetadata.updateAuthorityAddress;
    const collectionMetadataPda = findMetadataPda(collectionMint);
    const collectionEditionPda = findMasterEditionV2Pda(collectionMint);
    const collectionEdition = await MasterEditionV2.fromAccountAddress(connection, collectionEditionPda);
    const maxSupply = Number(collectionEdition.maxSupply);
    if (maxSupply !== 0)
      throw newProgramError(
        'create_nft_detach_error',
        HttpStatus.BAD_REQUEST,
        'unable to create NFT, while passing collection NFT address make sure that NFT has 0 max supply',
      );
    return { collectionAuthority, collectionMetadataPda, collectionEditionPda };
  }
}
