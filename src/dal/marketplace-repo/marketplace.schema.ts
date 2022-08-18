import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { ObjectId } from "mongoose";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export type MarketPlaceDocument = MarketPlace & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class MarketPlace {
	constructor(apiKeyId: ObjectId, network: WalletAdapterNetwork, marketplaceAddress: string, currencyAddress: string) {
		this.api_key_id = apiKeyId;
		this.network = network;
		this.marketplace_address = marketplaceAddress;
		this.currency_address = currencyAddress;
	}

	@Prop({ required: true, type: mongoose.Schema.Types.ObjectId, default: null })
	api_key_id: ObjectId;

	@Prop({ required: true, default: 'devnet' })
	network: string;

	@Prop({ required: true })
	marketplace_address: string;

	@Prop({ required: true })
	currency_address: string;

	@Prop({ required: false })
	created_at: Date;

	@Prop({ required: false })
	updated_at: Date;
}

export const MarketPlaceSchema = SchemaFactory.createForClass(MarketPlace);