import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { ObjectId } from "mongoose";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export type MarketplaceDocument = Marketplace & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Marketplace {
	constructor(apiKeyId?: ObjectId, network?: WalletAdapterNetwork, marketplaceAddress?: string, currencyAddress?: string, feePayer?: string, feeReceipient?: string, treasuryAddress?: string, transactionFee?: number, creator?: string, symbol?: string, authority?: string, canChangePrice?: boolean, requireSignOff?: boolean) {
		if (apiKeyId !== undefined) {
			this.api_key_id = apiKeyId;
		}
		if (network !== undefined) {
			this.network = network;
		}
		if (marketplaceAddress !== undefined) {
			this.address = marketplaceAddress;
		}
		if (currencyAddress !== undefined) {
			this.currency_address = currencyAddress;
		}
		if (feePayer !== undefined) {
			this.fee_payer = feePayer;
		}
		if (feeReceipient !== undefined) {
			this.fee_receipient = feeReceipient;
		}
		if (transactionFee !== undefined) {
			this.transaction_fee = transactionFee;
		}
		if (treasuryAddress !== undefined) {
			this.treasury_address = treasuryAddress;
		}
		if (creator !== undefined) {
			this.creator = creator;
		}
		if (requireSignOff !== undefined) {
			this.requires_sign_off = requireSignOff ? requireSignOff : false;
		}
		if (canChangePrice !== undefined) {
			this.can_change_sale_price = canChangePrice ? canChangePrice : false;
		}
		if (authority !== undefined) {
			this.authority = authority;
		}
		this.currency_symbol = symbol !== undefined ? symbol : "SOL";
	}

	@Prop({ required: true, type: mongoose.Schema.Types.ObjectId, default: null })
	api_key_id: ObjectId;

	@Prop({ required: true, default: 'devnet' })
	network: string;

	@Prop({ required: true })
	address: string;

	@Prop({ required: true })
	authority: string;

	@Prop({ required: true })
	currency_address: string;

	@Prop({ required: true, default: "SOL" })
	currency_symbol: string;

	@Prop({ required: true })
	fee_payer: string;

	@Prop({ required: true })
	fee_receipient: string;

	@Prop({ required: true })
	treasury_address: string;

	@Prop({ required: true })
	creator: string;

	@Prop({ required: true })
	transaction_fee: number;

	@Prop({ required: false, default: false })
	can_change_sale_price: boolean;

	@Prop({ required: false, default: false })
	requires_sign_off: boolean;

	@Prop({ required: false })
	created_at: Date;

	@Prop({ required: false })
	updated_at: Date;
}

export const MarketPlaceSchema = SchemaFactory.createForClass(Marketplace);