import { DateTime } from '@metaplex-foundation/js';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import mongoose, { ObjectId, Document } from 'mongoose';

export type ListingDocument = Listing & Document;

@Schema()
export class Listing {
  constructor(
    api: ObjectId,
    network: WalletAdapterNetwork,
    market: string,
    seller: string,
    price: number,
    nft: string,
    listState: string,
    createdAt: DateTime,
    receipt?: string,
    symbol?: string,
    cancelledAt?: DateTime,
  ) {
    this.api_key_id = api;
    this.network = network;
    this.marketplace_address = market;
    this.seller_address = seller;
    this.price = price;
    this.nft_address = nft;
    this.list_state = listState;
    this.created_at = new Date(createdAt.toNumber() * 1000); // taken from packages/js/src/types/DateTime.ts
    this.currency_symbol = symbol !== undefined ? symbol : 'SOL';
    this.cancelled_at = cancelledAt
      ? new Date(cancelledAt.toNumber() * 1000)
      : null;

    if (receipt !== undefined) {
      this.receipt_address = receipt;
    }
  }

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, default: null })
  api_key_id: ObjectId;

  @Prop({ required: true, default: 'devnet' })
  network: string;

  @Prop({ required: true })
  marketplace_address: string;

  @Prop({ required: true })
  seller_address: string;

  @Prop({ required: true, default: 0 })
  price: number;

  @Prop({ required: true })
  nft_address: string;

  @Prop({ required: true, default: 'SOL' })
  currency_symbol: string;

  @Prop({ required: true })
  list_state: string;

  @Prop({ required: false })
  buyer_address: string;

  @Prop({ required: false })
  receipt_address: string;

  @Prop({ required: false })
  purchase_receipt_address: string;

  @Prop({ required: false })
  cancelled_at: Date;

  @Prop({ required: true })
  created_at: Date;

  @Prop({ required: false })
  purchased_at: Date;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);
