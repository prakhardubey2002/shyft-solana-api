import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NftInfo, NftInfoDocument } from "./nft-info.schema";

@Injectable()
export class NftInfoAccessor {
    constructor(@InjectModel(NftInfo.name) public NftInfoDataModel: Model<NftInfoDocument>) { }

    public async insert(data: NftInfo): Promise<any> {
        let result = await this.NftInfoDataModel.create(data)
        return result
    }
}