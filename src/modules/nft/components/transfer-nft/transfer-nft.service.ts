import { HttpStatus, Injectable } from '@nestjs/common';
import { PublicKey, Transaction } from '@solana/web3.js';
import { NodeWallet } from '@metaplex/js';
import { AccountUtils } from 'src/common/utils/account-utils';
import { TransferNftDto, TransferNftDetachDto, TransferMultipleNftDto } from './dto/transfer.dto';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { UpdateNftService } from '../update-nft/update-nft.service';
import { Utility } from 'src/common/utils/utils';
import { newProgramError, newProgramErrorFrom } from 'src/core/program-error';
import { MultipleNftsWaitSyncEvent, NftSyncEvent, NftWaitSyncEvent } from 'src/modules/data-cache/db-sync/db.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { chunk } from 'lodash';

const maxNFTTransfersInOneTxn = 7;

@Injectable()
export class TransferNftService {
  constructor(private updateNftService: UpdateNftService, private eventEmitter: EventEmitter2) {}

  async transferNft(transferNftDto: TransferNftDto): Promise<any> {
    try {
      const { network, transfer_authority, from_address: fromAddress } = transferNftDto;
      const toAddress = new PublicKey(transferNftDto.to_address);
      const tokenAddress = new PublicKey(transferNftDto.token_address);
      // generate wallet
      const fromKeypair = AccountUtils.getKeypair(fromAddress);
      const wallet = new NodeWallet(fromKeypair);

      const connection = Utility.connectRpc(network);

      const tx = new Transaction();
      if (transfer_authority) {
        const updateAuthorityChangeInstruction = await Utility.nft.getNftAuthorityUpdateInstruction(
          connection,
          tokenAddress,
          fromKeypair.publicKey,
          toAddress,
        );
        tx.add(updateAuthorityChangeInstruction);
      }

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
        new PublicKey(tokenAddress),
        toAddress,
      );

      tx.add(
        createTransferCheckedInstruction(
          fromAccount.address,
          tokenAddress,
          toAccount.address,
          fromKeypair.publicKey,
          1,
          0,
        ),
      );
      tx.feePayer = fromKeypair.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;

      const signedTx = await wallet.signTransaction(tx);
      const transferTxId = await connection.sendRawTransaction(signedTx.serialize());

      await connection.confirmTransaction(transferTxId).catch((r) => {
        throw newProgramError('txn_confirmation_error', HttpStatus.GATEWAY_TIMEOUT, 'failed to confirm the txn');
      });
      const nftReadEvent = new NftSyncEvent(tokenAddress.toBase58(), network);
      this.eventEmitter.emit('nft.read', nftReadEvent);

      return { transferTxId: transferTxId };
    } catch (error) {
      throw newProgramErrorFrom(error, 'transfer_nft_error');
    }
  }

  async transferNftDetach(transferNftDto: TransferNftDetachDto): Promise<any> {
    try {
      const { network, from_address: fromAdress, transfer_authority } = transferNftDto;
      const tokenAddressPubKey = new PublicKey(transferNftDto.token_address);
      const toAddressPubKey = new PublicKey(transferNftDto.to_address);
      const connection = Utility.connectRpc(network);
      const fromAddressPubKey = new PublicKey(fromAdress);

      const tx: Transaction = new Transaction();

      if (transfer_authority) {
        const updateAuthorityChangeInstruction = await Utility.nft.getNftAuthorityUpdateInstruction(
          connection,
          tokenAddressPubKey,
          fromAddressPubKey,
          toAddressPubKey,
        );
        tx.add(updateAuthorityChangeInstruction);
      }

      // Find user token account
      const fromAccount = await getAssociatedTokenAddress(
        tokenAddressPubKey,
        fromAddressPubKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      // create associatedTokenAccount if not exist
      const { associatedAccountAddress: toAccount, createTx } = await Utility.account.getOrCreateAsscociatedAccountTx(
        connection,
        fromAddressPubKey,
        tokenAddressPubKey,
        toAddressPubKey,
      );
      if (createTx) {
        tx.add(createTx);
      }

      // Create transfer instruction
      tx.add(createTransferCheckedInstruction(fromAccount, tokenAddressPubKey, toAccount, fromAddressPubKey, 1, 0));

      tx.feePayer = fromAddressPubKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;

      const serializedTransaction = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const transactionBase64 = serializedTransaction.toString('base64');

      const nftReadEvent = new NftWaitSyncEvent(network, tokenAddressPubKey.toBase58(), 25000);
      this.eventEmitter.emit('nft.transfered', nftReadEvent);

      return { encoded_transaction: transactionBase64 };
    } catch (error) {
      throw newProgramErrorFrom(error, 'transfer_nft_error');
    }
  }

  async transferMultipleNfts(transferNftDto: TransferMultipleNftDto): Promise<any> {
    try {
      const {
        network,
        token_addresses: tokenAddresses,
        from_address: fromAddress,
        to_address: toAddress,
      } = transferNftDto;
      const connection = Utility.connectRpc(network);
      const fromAddressPubKey = new PublicKey(fromAddress);
      const toAddressPubKey = new PublicKey(toAddress);

      const txParts = chunk(tokenAddresses, maxNFTTransfersInOneTxn);
      const txs: string[] = [];

      for await (const txPart of txParts) {
        const tx = new Transaction();
        await Promise.all(
          txPart.map(async (x) => {
            const tokenAddressPubKey = new PublicKey(x);
            // Find user token account
            const fromAccount = await getAssociatedTokenAddress(
              tokenAddressPubKey,
              fromAddressPubKey,
              false,
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID,
            );

            // create associatedTokenAccount if not exist
            const { associatedAccountAddress: toAccount, createTx } =
              await Utility.account.getOrCreateAsscociatedAccountTx(
                connection,
                fromAddressPubKey,
                tokenAddressPubKey,
                toAddressPubKey,
              );
            if (createTx) {
              tx.add(createTx);
            }

            // Create transfer instruction
            tx.add(
              createTransferCheckedInstruction(fromAccount, tokenAddressPubKey, toAccount, fromAddressPubKey, 1, 0),
            );
          }),
        );
        tx.feePayer = fromAddressPubKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
        const serializedTransaction = tx.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });

        const transactionBase64 = serializedTransaction.toString('base64');
        txs.push(transactionBase64);
      }

      const nftsTransferedEvent = new MultipleNftsWaitSyncEvent(network, toAddress, tokenAddresses, 25000);
      this.eventEmitter.emit('multiple.nfts.transfered', nftsTransferedEvent);

      return { encoded_transactions: txs };
    } catch (error) {
      throw newProgramErrorFrom(error, 'transfer_nft_error');
    }
  }
}
