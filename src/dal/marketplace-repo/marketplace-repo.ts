import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { Marketplace, MarketplaceDocument } from "./marketplace.schema";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

@Injectable()
export class MarketplaceRepo {
	constructor(@InjectModel(Marketplace.name) public MarketplaceModel: Model<MarketplaceDocument>) { }

	public async insert(data: Marketplace): Promise<any> {
		try {
			const filter = { network: data.network, address: data.address }
			const result = await this.MarketplaceModel.updateOne(filter, data, { upsert: true });
			return result;
		} catch (err) {
			throw new Error(err);
		}
	}

	public async getMarketplacesByApiKeyId(network: WalletAdapterNetwork, apiKeyId: ObjectId): Promise<MarketplaceDocument[]> {
		try {
			const filter = { network: network, api_key_id: apiKeyId }
			const result = await this.MarketplaceModel.find(filter);
			return result;
		} catch (err) {
			throw new Error(err)
		}
	}

	public async getMarketplacesByAddress(network: WalletAdapterNetwork, address: string): Promise<MarketplaceDocument> {
		try {
			const filter = { network: network, address: address }
			const result = await this.MarketplaceModel.findOne(filter);
			return result;
		} catch (err) {
			throw new Error(err)
		}
	}

	public async updateMarketplace(market: Marketplace): Promise<any> {
		try {
			const filter = { address: market.address }
			const result = await this.MarketplaceModel.updateOne(filter, market, {
				upsert: true,
			})
			return result
		} catch (err) {
			throw new Error(err);
		}
	}
}