import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { MarketPlace, MarketPlaceDocument } from "./marketplace.schema";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

@Injectable()
export class MarketplaceRepo {
	constructor(@InjectModel(MarketPlace.name) public MarketplaceModel: Model<MarketPlaceDocument>) { }

	public async insert(data: MarketPlace): Promise<any> {
		try {
			const result = await this.MarketplaceModel.create(data);
			return result;
		} catch (err) {
			throw new Error(err);
		}
	}

	public async getMarketplaces(network: WalletAdapterNetwork, apiKeyId: ObjectId): Promise<MarketPlaceDocument[]> {
		try {
			const filter = { network: network, api_key_id: apiKeyId }
			const result = await this.MarketplaceModel.find(filter);
			return result;
		} catch (err) {
			throw new Error(err)
		}
	}
}