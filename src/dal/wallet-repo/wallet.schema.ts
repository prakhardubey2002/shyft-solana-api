import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Wallet {
  constructor(network: WalletAdapterNetwork, walletAddress: string) {
    this.network = network;
    this.address = walletAddress;
  }

  @Prop({ required: true, default: 'devnet' })
  network: string;

  @Prop({ required: true, type: String })
  address: string;

  @Prop()
  updated_at: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
