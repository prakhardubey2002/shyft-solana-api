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

interface collectionData {
  address?: string;
  verified?: boolean;
  name?: string;
  family?: string;
}

export interface file {
  uri: string;
  type: string;
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class NftInfo {
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, default: null })
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

  @Prop({ required: false, default: '' })
  image_uri: string;

  @Prop()
  cached_image_uri: string;

  @Prop({ required: true, default: '' })
  metadata_uri: string;

  @Prop({ required: false, type: Object, default: {} })
  attributes: { [k: string]: string | number };

  @Prop({ required: false })
  creators: creator[];

  @Prop({ type: Object, required: false })
  collection_data: collectionData;

  @Prop({ required: false, type: Object })
  files: file[] | file;

  @Prop({ required: false })
  is_loaded_metadata: boolean;
}

export const NftInfoSchema = SchemaFactory.createForClass(NftInfo);
