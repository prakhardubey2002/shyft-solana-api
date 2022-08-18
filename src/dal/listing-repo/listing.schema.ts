import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import mongoose, { ObjectId } from "mongoose";

export type ListingDocument = Listing & Document;

@Schema()
export class Listing {
	constructor(api: ObjectId, network: WalletAdapterNetwork, market: string, seller: string, price: number, nft: string, listState: string) {
		this.api_key_id = api;
		this.network = network;
		this.marketplace_address = market;
		this.seller_address = seller;
		this.price = price;
		this.nft_address = nft;
		this.list_state = listState;
		this.created_at = new Date();	// This param should ideally be set to the blockchain listing's date time.
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

	@Prop({ required: true })
	list_state: string;

	@Prop({ required: false })
	buyer_address: string;

	@Prop({ required: false })
	cancelled_at: Date;

	@Prop({ required: true })
	created_at: Date;

	@Prop({ required: false })
	purchased_at: Date;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);