/* eslint-disable prettier/prettier */
import { HttpException, Injectable } from '@nestjs/common';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Connection, NodeWallet, programs } from '@metaplex/js';
import { Creator, Metadata, } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { NftUpdateEvent } from '../../../db/db-sync/db.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Network } from 'src/dto/network.dto';
import { AccountUtils } from 'src/common/utils/account-utils';

interface UpdateParams {
  update_authority: string,
  new_update_authority: string,
  royalty: number,
  private_key: string,
  is_mutable: boolean,
  primary_sale_happened: boolean,
  network: Network,
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
}