import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Metaplex, keypairIdentity, findAssociatedTokenAccountPda, findMetadataPda, findMasterEditionV2Pda, parseOriginalEditionAccount, findEditionPda, findEditionMarkerPda, AccountNotFoundError } from '@metaplex-foundation/js';
import { PrintNftEditionDto, PrintNftEditionDetachDto } from './dto/mint-nft.dto';
import { AccountUtils } from 'src/common/utils/account-utils';
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createInitializeMintInstruction, createMintToInstruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createMintNewEditionFromMasterEditionViaTokenInstruction } from '@metaplex-foundation/mpl-token-metadata';
import * as BN from 'bn.js';
@Injectable()
export class MintNftService {
  async printNewEdition(printNftEditionDto: PrintNftEditionDto): Promise<any> {
    const {
      network,
      private_key,
      master_nft_address,
      receiver,
      transfer_authority,
    } = printNftEditionDto;
    const feePayer = AccountUtils.getKeypair(private_key);
    const connection = new Connection(clusterApiUrl(network));
    const metaplex = Metaplex.make(connection).use(keypairIdentity(feePayer));
    const master_address = new PublicKey(master_nft_address);
    const newOwner = receiver ? new PublicKey(receiver) : feePayer.publicKey;
    const newUpdateAuthority = transfer_authority ? newOwner : feePayer.publicKey;
    const { nft: printedNft, transactionId: txId } = await metaplex.nfts().printNewEdition(master_address, {
      newUpdateAuthority,
      newOwner,
    });
    return { mint: printedNft.mint.toBase58(), txId: txId };
  }

  async printNewEditionDetach(printNftEditionDetachDto: PrintNftEditionDetachDto): Promise<any> {
    try {
      const {
        network,
        wallet,
        master_nft_address,
        receiver,
        transfer_authority,
      } = printNftEditionDetachDto;
      const addressPubKey = new PublicKey(wallet);
      const connection = new Connection(clusterApiUrl(network));
      const metaplex = Metaplex.make(connection);
      // Original NFT.
      const originalMint = new PublicKey(master_nft_address);
      const originalAssociatedToken = findAssociatedTokenAccountPda(
        originalMint,
        addressPubKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const originalMetadata = findMetadataPda(originalMint);
      const originalEdition = findMasterEditionV2Pda(originalMint);
      const originalEditionAccount = parseOriginalEditionAccount(
        await metaplex.rpc().getAccount(originalEdition),
      );

      if (!originalEditionAccount.exists) {
        throw new AccountNotFoundError(
          originalEdition,
          'OriginalEdition',
          `Ensure the provided mint address for the original NFT [${originalMint.toBase58()}] ` +
            `is correct and that it has an associated OriginalEdition PDA.`
        );
      }

      const edition = new BN(
        originalEditionAccount.data.supply,
        'le',
      ).add(new BN(1));

      const originalEditionMarkPda = findEditionMarkerPda(originalMint, edition);
      // New NFT
      const newMintKeypair = Keypair.generate();

      const newMetadata = findMetadataPda(newMintKeypair.publicKey);
      const newEdition = findEditionPda(newMintKeypair.publicKey);

      // owner, update_authority & associated token
      const newOwner = receiver ? new PublicKey(receiver) : addressPubKey;
      const newUpdateAuthority = transfer_authority ? newOwner : addressPubKey;
      const newAssociatedToken = findAssociatedTokenAccountPda(
        newMintKeypair.publicKey,
        newOwner,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );
      const mintRent = await getMinimumBalanceForRentExemptMint(connection);

      const tx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: addressPubKey,
          newAccountPubkey: newMintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          newMintKeypair.publicKey,
          0,
          addressPubKey,
          addressPubKey,
          TOKEN_PROGRAM_ID,
        ),
        createAssociatedTokenAccountInstruction(
          addressPubKey,
          newAssociatedToken,
          newOwner,
          newMintKeypair.publicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
        createMintToInstruction(
          newMintKeypair.publicKey,
          newAssociatedToken,
          addressPubKey,
          1,
        ),
        createMintNewEditionFromMasterEditionViaTokenInstruction(
          {
            newMetadata,
            newEdition,
            masterEdition: originalEdition,
            newMint: newMintKeypair.publicKey,
            editionMarkPda: originalEditionMarkPda,
            newMintAuthority: addressPubKey,
            payer: addressPubKey,
            tokenAccountOwner: addressPubKey,
            tokenAccount: originalAssociatedToken,
            newMetadataUpdateAuthority: newUpdateAuthority,
            metadata: originalMetadata,
          },
          { mintNewEditionFromMasterEditionViaTokenArgs: { edition } },
        ),
      );

      tx.feePayer = addressPubKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;;
      tx.partialSign(newMintKeypair);

      const serializedTransaction = tx.serialize({ requireAllSignatures: false, verifySignatures: false });

      const transactionBase64 = serializedTransaction.toString('base64');

      return { encoded_transaction: transactionBase64, mint: newMintKeypair.publicKey.toBase58() };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
