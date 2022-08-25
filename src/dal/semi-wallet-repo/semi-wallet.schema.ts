import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';

export type SemiWalletDocument = SemiCustodialWallet & Document;

@Schema({ timestamps: { createdAt: 'created_at' } })
export class SemiCustodialWallet {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, default: null })
  api_key_id: ObjectId;

  @Prop({ required: true })
  public_key: string;

  @Prop({ required: true })
  encrytped_private_key: string;

  @Prop({ required: true })
  params: string;
}

export const SemiWalletSchema = SchemaFactory.createForClass(SemiCustodialWallet);
