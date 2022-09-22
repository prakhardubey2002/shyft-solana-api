import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NftInfo, NftInfoDocument } from './nft-info.schema';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

@Injectable()
export class NftInfoAccessor {
  constructor(
    @InjectModel(NftInfo.name) public NftInfoDataModel: Model<NftInfoDocument>,
  ) {}

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
      const result = await this.NftInfoDataModel.findOneAndUpdate(
        filter,
        data,
        {
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
        const result = await this.NftInfoDataModel.findOne(filter).sort({
          updated_at: 'desc',
        });
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

  public async find(
    filter: object,
    page?: number,
    size?: number,
  ): Promise<NftInfoDocument[]> {
    try {
      let result: NftInfoDocument[];
      if (page && size) {
        result = await this.NftInfoDataModel.find(filter)
          .sort({ updated_at: 'desc' })
          .limit(size)
          .skip((page - 1) * size);
      } else {
        result = await this.NftInfoDataModel.find(filter).sort({
          updated_at: 'desc',
        });
      }
      return result;
    } catch (err) {
      console.log(err);
    }
    return [];
  }

  public async findNftsByOwnerAndUpdateAuthority(
    network: WalletAdapterNetwork,
    owner: string,
    updateAuthority?: string,
  ): Promise<NftInfoDocument[]> {
    const filter = { owner: owner, network: network };
    if (updateAuthority !== undefined) {
      filter['update_authority'] = updateAuthority;
    }
    return await this.NftInfoDataModel.find(filter).sort({updated_at: 'desc'});
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
      const ops = [];
      nfts?.map(async (nft) => {
        const filter = { mint: nft.mint, network: nft.network };
        ops.push({ updateOne: { filter: filter, update: nft, upsert: true } });
      });
      await this.NftInfoDataModel.bulkWrite(ops);
    } catch (err) {
      console.log(err);
    }
    return null;
  }

  public async deleteManyNfts(
    nft_addresess: string[],
    network: WalletAdapterNetwork,
  ): Promise<any> {
    try {
      const ops = [];
      nft_addresess?.map(async (nft_addr) => {
        const filter = { mint: nft_addr, network: network };
        ops.push({ deleteOne: { filter: filter }});
      });
      console.log('nfts deleted: ', ops);
      return await this.NftInfoDataModel.bulkWrite(ops);
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public async deleteNft(
    nft_addr: string,
    network: WalletAdapterNetwork,
  ): Promise<any> {
    if (nft_addr && network) {
      const result = await this.NftInfoDataModel.deleteOne({
        mint: nft_addr,
        network: network,
      });
      return result;
    }
  }

  public async updateNftOwner(
    network: WalletAdapterNetwork,
    nftAddress: string,
    buyerAddress: string,
  ): Promise<any> {
    const filter = { network: network, mint: nftAddress };
    const update = { owner: buyerAddress };
    const result = await this.NftInfoDataModel.updateOne(filter, update);
    return result;
  }
}
