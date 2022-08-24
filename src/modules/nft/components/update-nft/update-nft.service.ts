/* eslint-disable prettier/prettier */
import { HttpException, Injectable } from '@nestjs/common';
import { clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';
import { Connection, NodeWallet, programs } from '@metaplex/js';
import { Creator, Metadata, } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { NftUpdateEvent } from '../../../helper/db-sync/db.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { AccountUtils } from 'src/common/utils/account-utils';
import { Creator as CreatorV2, createUpdateMetadataAccountV2Instruction, DataV2 } from '@metaplex-foundation/mpl-token-metadata';

interface UpdateParams {
  update_authority: string,
  new_update_authority: string,
  royalty: number,
  private_key: string,
  is_mutable: boolean,
  primary_sale_happened: boolean,
  network: WalletAdapterNetwork,
  token_address: string,
  name: string,
  symbol: string,
}

interface UpdateDetachParams {
  update_authority: string,
  royalty: number,
  wallet: string,
  is_mutable: boolean,
  primary_sale_happened: boolean,
  network: WalletAdapterNetwork,
  token_address: string,
  name: string,
  symbol: string,
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

      const connection = new Connection(clusterApiUrl(network), 'confirmed');

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

      const newAuthority = new_update_authority ? new_update_authority : update_authority;

      const res = new programs.metadata.UpdateMetadataV2({
        recentBlockhash: (await connection.getLatestBlockhash('finalized')).blockhash,
        feePayer: wallet.publicKey
      }, {
        metadata: pda,
        updateAuthority: new PublicKey(update_authority),
        newUpdateAuthority: new PublicKey(newAuthority),
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

      const nftUpdatedEvent = new NftUpdateEvent(token_address, network)
      this.eventEmitter.emit('nft.updated', nftUpdatedEvent)

      return { txId: result };
    } catch (error) {

      throw new HttpException(error.message, error.status);
    }
  }


  async updateNftDetach(metaDataUri: string, updateParams: UpdateDetachParams): Promise<any> {
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
        wallet,
        is_mutable,
        primary_sale_happened,
      } = updateParams;

      const connection = new Connection(clusterApiUrl(network), 'confirmed');

      const addressPubKey = new PublicKey(wallet);

      //get token's PDA (metadata address)
      const pda = await Metadata.getPDA(token_address);
      const creator: CreatorV2 = {
        address: addressPubKey,
        verified: true,
        share: 100,
      };
      const updateAuthority = update_authority ? new PublicKey(update_authority) : addressPubKey;

      const tx = new Transaction().add(
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
                creators: [creator],
                collection: null,
                uses: null,
              } as DataV2,
              updateAuthority,
              primarySaleHappened: primary_sale_happened,
              isMutable: is_mutable,
            }
          }
      ));

      const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
      tx.feePayer = addressPubKey;
      tx.recentBlockhash = blockHash;
      const serializedTransaction = tx.serialize({ requireAllSignatures: false });
      const transactionBase64 = serializedTransaction.toString('base64');

      return transactionBase64;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}