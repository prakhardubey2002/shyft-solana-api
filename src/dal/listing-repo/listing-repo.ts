import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

import { Listing, ListingDocument } from "./listing.schema";
import { DateTime } from "@metaplex-foundation/js";

@Injectable()
export class ListingRepo {
	constructor(@InjectModel(Listing.name) public ListingModel: Model<ListingDocument>) { }

	public async insert(data: Listing): Promise<any> {
		try {
			const result = await this.ListingModel.create(data);
			return result;
		} catch (err) {
			throw new Error(err);
		}
	}

	public async markSold(network: WalletAdapterNetwork, listState: string, buyer: string, purchasedAt: DateTime, purchaseReceipt: string): Promise<any> {
		try {
			const filter = { network: network, list_state: listState };
			const purchasedTime = new Date(purchasedAt.toNumber() * 1000);
			const update = { buyer_address: buyer, purchased_at: purchasedTime, purchase_receipt_address: purchaseReceipt }
			const result = await this.ListingModel.updateOne(filter, update);
			return result;
		} catch (err) {
			throw new Error(err);
		}
	}

	async updateCancelledAt(network: WalletAdapterNetwork, listState: string, cancelTime: Date): Promise<any> {
		try {
			const filter = { network: network, list_state: listState, cancelled_at: { $exists: false } };
			const update = { cancelled_at: cancelTime };
			const result = await this.ListingModel.updateOne(filter, update);
			return result
		} catch (err) {
			throw new Error(err)
		}
	}

	async getActiveListings(network: WalletAdapterNetwork, marketPlaceAddress: string): Promise<ListingDocument[]> {
		try {
			const filter = { network: network, marketplace_address: marketPlaceAddress, cancelled_at: { $exists: false }, purchased_at: { $exists: false } }
			const result = await this.ListingModel.find(filter);
			return result;
		} catch (err) {
			throw new Error(err);
		}
	}

	async getSellerListings(network: WalletAdapterNetwork, marketPlaceAddress: string, seller: string): Promise<ListingDocument[]> {
		try {
			const filter = { network: network, marketplace_address: marketPlaceAddress, seller_address: seller };
			const result = await this.ListingModel.find(filter);
			return result;
		} catch (err) {
			throw new Error(err);
		}
	}

	async getOrders(network: WalletAdapterNetwork, marketPlaceAddress: string, buyer: string): Promise<ListingDocument[]> {
		try {
			const filter = { network: network, marketplace_address: marketPlaceAddress, buyer_address: buyer };
			const result = await this.ListingModel.find(filter);
			return result;
		} catch (err) {
			throw new Error(err);
		}
	}
}