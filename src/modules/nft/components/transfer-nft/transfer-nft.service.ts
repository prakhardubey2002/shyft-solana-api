import { HttpException, Injectable } from '@nestjs/common';
import { clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';
import { Connection, NodeWallet } from '@metaplex/js';
import { AccountUtils } from 'src/common/utils/account-utils';
import { TransferNftDto } from './dto/transfer.dto';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { UpdateNftService } from '../update-nft/update-nft.service';
import { Metaplex } from '@metaplex-foundation/js';
import { createUpdateMetadataAccountV2Instruction, DataV2 } from '@metaplex-foundation/mpl-token-metadata';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { getAssociatedTokenAccountOrCreateAsscociatedAccountTx } from 'src/common/utils/get-or-create-associated-token-account';

@Injectable()
export class TransferNftService {
  constructor(private updateNftService: UpdateNftService) {}

  async transferNft(transferNftDto: TransferNftDto): Promise<any> {
    try {
      const {
        network,
        from_address: fromAdress,
        transfer_authority,
      } = transferNftDto;
      const tokenAddress = new PublicKey(transferNftDto.token_address);
      const toAddress = new PublicKey(transferNftDto.to_address);

      const connection = new Connection(clusterApiUrl(network), 'confirmed');

      // generate wallet
      const fromKeypair = AccountUtils.getKeypair(fromAdress);
      const wallet = new NodeWallet(fromKeypair);

      // Find token accounts
      const fromAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        tokenAddress,
        fromKeypair.publicKey,
      );
      const toAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        tokenAddress,
        toAddress,
      );

      // Create transfer instruction
      const ix = createTransferCheckedInstruction(
        fromAccount.address,
        tokenAddress,
        toAccount.address,
        fromKeypair.publicKey,
        1,
        0,
      );
      const tx = new Transaction().add(ix);
      tx.feePayer = fromKeypair.publicKey;
      tx.recentBlockhash = (
        await connection.getLatestBlockhash('finalized')
      ).blockhash;

      // Sign and send it
      const signedTx = await wallet.signTransaction(tx);
      const transferTxId = await connection.sendRawTransaction(
        signedTx.serialize(),
      );

      const isSuccessful = await connection.confirmTransaction(transferTxId);

      //Now update the authority
      let updateTxId;
      if (isSuccessful.value.err === null && transfer_authority) {
        //Update Authority
        const metaplex = Metaplex.make(connection);
        const nft = await metaplex.nfts().findByMint(tokenAddress);
        updateTxId = await this.updateNftService.updateNft(nft.uri, {
          is_mutable: nft.isMutable,
          name: nft.name,
          network,
          primary_sale_happened: nft.primarySaleHappened,
          royalty: nft.sellerFeeBasisPoints,
          symbol: nft.symbol,
          token_address: nft.mint.toBase58(),
          update_authority: nft.updateAuthority.toBase58(),
          new_update_authority: toAddress.toBase58(),
          private_key: fromAdress,
        });
      }
      return { updateTxId: updateTxId?.txId ?? 'update_authority not transfered', transferTxId: transferTxId };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message || error, error.status);
    }
  }

  async transferNftDetach(transferNftDto: TransferNftDto): Promise<any> {
    try {
      const {
        network,
        from_address: fromAdress,
        transfer_authority,
      } = transferNftDto;
      const tokenAddressPubKey = new PublicKey(transferNftDto.token_address);
      const toAddressPubKey = new PublicKey(transferNftDto.to_address);

      const connection = new Connection(clusterApiUrl(network), 'confirmed');

      // generate wallet
      const fromAddressPubKey = new PublicKey(fromAdress);

      // Find token accounts
      const fromAccount = await getAssociatedTokenAddress(
        tokenAddressPubKey,
        fromAddressPubKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const toAccount = await getAssociatedTokenAddress(
        tokenAddressPubKey,
        toAddressPubKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      let tx: Transaction = new Transaction();
      // create associatedTokenAccount if not exist
      const associatedAccountTx = await getAssociatedTokenAccountOrCreateAsscociatedAccountTx(connection, fromAddressPubKey, tokenAddressPubKey, toAddressPubKey);
      if (associatedAccountTx instanceof Transaction) {
        tx.add(associatedAccountTx);
      }

      if (!transfer_authority) {
        // Create transfer instruction
        tx = tx.add(
          createTransferCheckedInstruction(
            fromAccount,
            tokenAddressPubKey,
            toAccount,
            fromAddressPubKey,
            1,
            0,
          ),
        );
      } else {
        const metaplex = Metaplex.make(connection);
        const nft = await metaplex.nfts().findByMint(tokenAddressPubKey);
        const pda = await Metadata.getPDA(tokenAddressPubKey);

        tx = tx.add(
          createTransferCheckedInstruction(
            fromAccount,
            tokenAddressPubKey,
            toAccount,
            fromAddressPubKey,
            1,
            0,
          ),
          createUpdateMetadataAccountV2Instruction(
            {
              metadata: pda,
              updateAuthority: toAddressPubKey,
            },
            {
              updateMetadataAccountArgsV2: {
                data: {
                  name: nft.name,
                  symbol: nft.symbol,
                  uri: nft.uri,
                  sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
                  creators: nft.creators,
                  collection: nft.collection,
                  uses: nft.uses,
                } as DataV2,
                updateAuthority: toAddressPubKey,
                primarySaleHappened: nft.primarySaleHappened,
                isMutable: nft.isMutable,
              },
            },
          ),
        );
      }

      tx.feePayer = fromAddressPubKey;
      tx.recentBlockhash = (
        await connection.getLatestBlockhash('finalized')
      ).blockhash;

      const serializedTransaction = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
      const transactionBase64 = serializedTransaction.toString('base64');
      return { encoded_transaction: transactionBase64 };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message || error, error.status);
    }
  }
}
