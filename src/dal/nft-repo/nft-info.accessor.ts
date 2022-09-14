import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NftInfo, NftInfoDocument } from './nft-info.schema';

@Injectable()
export class NftInfoAccessor {
  constructor(@InjectModel(NftInfo.name) public NftInfoDataModel: Model<NftInfoDocument>) { }

  public async insert(data: NftInfo): Promise<any> {
    try {
      const result = await this.NftInfoDataModel.create(data);
      return result;
    } catch (err) {
      console.log(err);
    }
    return null;
  }

  public async readNft(data: object): Promise<NftInfoDocument> {
    try {
      const result = await this.NftInfoDataModel.findOne(data);
      return result;
    } catch (err) {
      console.log(err);
    }
    return null;
  }

  public async updateNft(data: NftInfo): Promise<NftInfoDocument> {
    try {
      const filter = { mint: data?.mint, network: data?.network };
      const result = await this.NftInfoDataModel.findOneAndUpdate(filter, data, {
          upsert: true,
          new: true,
        },
      );
      return result;
    } catch (err) {
      console.log(err);
    }
    return null;
  }

  public async findOne(filter: object): Promise<NftInfoDocument> {
    try {
      if (filter) {
        const result = await this.NftInfoDataModel.findOne(filter).sort({ updated_at: 'desc' });
        return result;
      }
    } catch (err) {
      console.log(err);
    }
    return null;
  }

  public async isExist(filter: object): Promise<boolean> {
    try {
      const result = await this.NftInfoDataModel.exists(filter);
      return Boolean(result?._id);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  public async find(filter: object, page?: number, size?: number): Promise<NftInfoDocument[]> {
    try {
      let result: NftInfoDocument[];
      if (page && size) {
        result = await this.NftInfoDataModel.find(filter)
          .sort({ updated_at: 'desc' })
          .limit(size)
          .skip((page - 1) * size);
      } else {
        result = await this.NftInfoDataModel.find(filter).sort({ updated_at: 'desc' });
      }
      return result;
    } catch (err) {
      console.log(err);
    }
    return [];
  }

  public async count(filter: object): Promise<number> {
    try {
      const result = await this.NftInfoDataModel.count(filter);
      return result;
    } catch (err) {
      console.log(err);
    }
    return null;
  }

  public async updateManyNft(nfts: NftInfo[]): Promise<any> {
    try {
      await Promise.all(
        nfts?.map(async (nft) => {
          const filter = { mint: nft.mint };
          await this.NftInfoDataModel.updateOne(filter, nft, { upsert: true });
        }),
      );
    } catch (err) {
      console.log(err);
    }
    return null;
  }

  public async deleteNft(filter: object): Promise<any> {
    const result = await this.NftInfoDataModel.deleteOne(filter);
    return result;
  }
}
