/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PublicKey, Transaction } from '@solana/web3.js';
import { NodeWallet, programs } from '@metaplex/js';
import { Creator, Metadata, } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { NftSyncEvent } from '../../../data-cache/db-sync/db.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { AccountUtils } from 'src/common/utils/account-utils';
import { Collection, createUpdateMetadataAccountV2Instruction, DataV2 } from '@metaplex-foundation/mpl-token-metadata';
import { Utility, ServiceCharge } from 'src/common/utils/utils';
import { ProgramError } from '@metaplex-foundation/js';
import { newProgramErrorFrom } from 'src/core/program-error';
import {Creator as CreatorV2 } from '@metaplex-foundation/js'

interface UpdateParams {
  update_authority: string;
  new_update_authority: string;
  royalty: number;
  private_key: string;
  is_mutable: boolean;
  primary_sale_happened: boolean;
  network: WalletAdapterNetwork;
  token_address: string;
  name: string;
  symbol: string;
}

interface UpdateDetachParams {
  updateAuthority: string;
  royalty: number;
  wallet: string;
  isMutable: boolean;
  primarySaleHappened: boolean;
  network: WalletAdapterNetwork;
  token_address: string;
  name: string;
  symbol: string;
  serviceCharge: ServiceCharge;
}

export type UpdateDetachV2Params = {
  network: WalletAdapterNetwork;
  tokenAddress: string;
  updateAuthorityAddress: string;
  creators: CreatorV2[];
  collection?: Collection;
  royalty?: number;
  isMutable?: boolean;
  primarySaleHappened?: boolean;
  name?: string;
  symbol?: string;
  feePayer?: string;
  serviceCharge?: ServiceCharge;
}

@Injectable()
export class UpdateNftService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private eventEmitter: EventEmitter2) { }

  async updateNft(metaDataUri: string, updateParams: UpdateParams): Promise<any> {
    if (!metaDataUri) {
      throw new Error('metadata URI missing');
    }
    try {
      const {
        network,
        token_address,
        name,
        symbol,
        update_authority,
        royalty,
        private_key,
        is_mutable,
        primary_sale_happened,
        new_update_authority,
      } = updateParams;

      const connection = Utility.connectRpc(network);

      //generate wallet
      const keypair = AccountUtils.getKeypair(private_key);
      const wallet = new NodeWallet(keypair);

      //get token's PDA (metadata address)
      const pda = await Metadata.getPDA(token_address);
      const creators = new Array<Creator>(new programs.metadata.Creator({
        address: wallet.publicKey.toString(),
        verified: true,
        share: 100,
      }))

      const res = new programs.metadata.UpdateMetadataV2({
        recentBlockhash: (await connection.getLatestBlockhash('finalized')).blockhash,
        feePayer: wallet.publicKey
      }, {
        metadata: pda,
        updateAuthority: new PublicKey(update_authority),
        newUpdateAuthority: new_update_authority ? new PublicKey(new_update_authority): undefined,
        metadataData: new programs.metadata.DataV2({
          name: name,
          symbol: symbol,
          uri: metaDataUri,
          sellerFeeBasisPoints: royalty,
          creators: creators,
          uses: null,
          collection: null,
        }),
        primarySaleHappened: primary_sale_happened,
        isMutable: is_mutable
      });

      const signedTransaction = await wallet.signTransaction(res)
      const result = await connection.sendRawTransaction(signedTransaction.serialize());

      const nftUpdatedEvent = new NftSyncEvent(token_address, network)
      this.eventEmitter.emit('nft.updated', nftUpdatedEvent)

      return { txId: result };
    } catch (error) {
      throw newProgramErrorFrom(error, 'update_nft_error');
    }
  }


  async updateNftDetach(metaDataUri: string, updateDetachParams: UpdateDetachParams): Promise<any> {
    if (!metaDataUri) {
      throw new Error('metadata URI missing');
    }
    try {
      const {
        network,
        token_address,
        name,
        symbol,
        updateAuthority,
        royalty,
        wallet,
        isMutable: isMutable,
        primarySaleHappened,
        serviceCharge,
      } = updateDetachParams;

      const connection = Utility.connectRpc(network);

      const addressPubKey = new PublicKey(wallet);

      //get token's PDA (metadata address)
      const pda = await Metadata.getPDA(token_address);
      const creator: CreatorV2 = {
        address: addressPubKey,
        verified: true,
        share: 100,
      };
      const updateAuth = updateAuthority ? new PublicKey(updateAuthority) : addressPubKey;

      let tx = new Transaction().add(
        createUpdateMetadataAccountV2Instruction(
          {
            metadata: pda,
            updateAuthority: updateAuth,
          },
          {
            updateMetadataAccountArgsV2: {
              data: {
                name,
                symbol,
                uri: metaDataUri,
                sellerFeeBasisPoints: royalty,
                creators: [creator],
                collection: null,
                uses: null,
              } as DataV2,
              updateAuthority: updateAuth,
              primarySaleHappened: primarySaleHappened,
              isMutable: isMutable,
            }
          }
      ));

      if (serviceCharge) {
        tx = await Utility.account.addSeviceChargeOnTransaction(connection, tx, serviceCharge, addressPubKey);
      }

      const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
      tx.feePayer = addressPubKey;
      tx.recentBlockhash = blockHash;
      const serializedTransaction = tx.serialize({ requireAllSignatures: false });
      const transactionBase64 = serializedTransaction.toString('base64');

      const nftUpdatedEvent = new NftSyncEvent(token_address, network)
      this.eventEmitter.emit('nft.updated', nftUpdatedEvent)

      return transactionBase64;
    } catch (error) {
      if (error instanceof ProgramError) {
        throw error;
      } else {
        throw newProgramErrorFrom(error, 'update_nft_detach_error');
      }
    }
  }

  async updateNftDetachV2(metaDataUri: string, updateDetachV2Params: UpdateDetachV2Params): Promise<any> {
    if (!metaDataUri) {
      throw new Error('metadata URI missing');
    }
    try {
      const {
        network,
        tokenAddress,
        name,
        symbol,
        creators,
        updateAuthorityAddress,
        royalty,
        isMutable,
        primarySaleHappened,
        feePayer,
        serviceCharge,
        collection,
      } = updateDetachV2Params;

      const connection = Utility.connectRpc(network);
      const pda = await Metadata.getPDA(tokenAddress);
      const updateAuthority = new PublicKey(updateAuthorityAddress);
      const txnFeePayer = feePayer ? new PublicKey(feePayer) : updateAuthority;

      let tx = new Transaction().add(
        createUpdateMetadataAccountV2Instruction(
          {
            metadata: pda,
            updateAuthority,
          },
          {
            updateMetadataAccountArgsV2: {
              data: {
                name,
                symbol,
                uri: metaDataUri,
                sellerFeeBasisPoints: royalty,
                creators,
                collection: collection,
                uses: null,
              } as DataV2,
              updateAuthority,
              primarySaleHappened: primarySaleHappened,
              isMutable: isMutable,
            }
          }
      ));

      if (serviceCharge) {
        tx = await Utility.account.addSeviceChargeOnTransaction(connection, tx, serviceCharge, txnFeePayer);
      }

      const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
      tx.feePayer = txnFeePayer;
      tx.recentBlockhash = blockHash;
      const serializedTransaction = tx.serialize({ requireAllSignatures: false });
      const transactionBase64 = serializedTransaction.toString('base64');

      const nftUpdatedEvent = new NftSyncEvent(tokenAddress, network)
      this.eventEmitter.emit('nft.updated', nftUpdatedEvent)

      return transactionBase64;
    } catch (error) {
      if (error instanceof ProgramError) {
        throw error;
      } else {
        throw newProgramErrorFrom(error, 'update_nft_v2_error');
      }
    }
  }
}