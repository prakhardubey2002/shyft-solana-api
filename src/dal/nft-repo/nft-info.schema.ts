/*
1. schema for the nft document
2. functions to read, write and update these documents. These functions will be called from the service layers
*/
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';

export type NftInfoDocument = NftInfo & Document;

interface creator {
  address: string;
  verified: boolean;
  share: number;
}

interface file {
  uri: string;
  type: boolean;
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class NftInfo {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, default: null })
  api_key_id: ObjectId;

  @Prop({ required: true, default: 'solana' })
  chain: string;

  @Prop({ required: true, default: 'devnet' })
  network: string;

  @Prop({ required: true })
  update_authority: string;

  @Prop({ required: true, default: '' })
  owner: string;

  @Prop({ required: true })
  mint: string;

  @Prop({ required: true })
  primary_sale_happened: boolean;

  @Prop({ required: true })
  is_mutable: boolean;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: false, min: 0, max: 10000, default: 0 })
  royalty: number;

  @Prop({ required: false })
  max_supply: number;

  @Prop({ required: false })
  supply: number;

  @Prop({ required: false, default: '' })
  external_url: string;

  @Prop({ required: true, default: '' })
  image_uri: string;

  @Prop()
  cached_image_uri: string;

  @Prop({ required: true, default: '' })
  metadata_uri: string;

  @Prop({ required: false, type: Object, default: {} })
  attributes: { [k: string]: string | number };

  @Prop({ required: false })
  creators: creator[];

  @Prop({ required: false })
  files: file[];
}

export const NftInfoSchema = SchemaFactory.createForClass(NftInfo);
