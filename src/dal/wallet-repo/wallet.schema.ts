import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export type DomainType = {
  address: string;
  name: string;
};

export interface WalletParams {
  network: WalletAdapterNetwork;
  walletAddress: string;
  domains?: DomainType[];
  lastDomainsSync?: Date;
  lastNftsSync?: Date;
}

export type WalletDocument = Wallet & Document;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Wallet {
  constructor(params: WalletParams) {
    this.network = params.network;
    this.address = params.walletAddress;
    this.domains = params?.domains;
    this.last_domains_sync = params?.lastDomainsSync;
    this.last_nfts_sync = params?.lastNftsSync;
  }

  @Prop({ required: true, default: 'devnet' })
  network: string;

  @Prop({ required: true, type: String })
  address: string;

  @Prop({ type: Array })
  domains: DomainType[];

  @Prop()
  last_domains_sync: Date;

  @Prop()
  last_nfts_sync: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
