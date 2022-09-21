import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Listing, ListingDocument } from './listing.schema';
import { DateTime } from '@metaplex-foundation/js';
import { GetStatsDto } from 'src/modules/marketplace/dto/get-stats.dto';
import { configuration } from 'src/common/configs/config';
import { ListingDbDto } from './dto';

const { minDateOnSearch } = configuration();

@Injectable()
export class ListingRepo {
  constructor(
    @InjectModel(Listing.name) public ListingModel: Model<ListingDocument>,
  ) {}

  public async insert(data: Listing): Promise<any> {
    try {
      const filter = { network: data.network, list_state: data.list_state };
      const result = await this.ListingModel.updateOne(filter, data, {
        upsert: true,
      });
      console.log('List data inserted in db', data);
      console.log(result);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  public async markSold(
    network: WalletAdapterNetwork,
    listState: string,
    buyer: string,
    purchasedAt: DateTime,
    purchaseReceipt: string,
  ): Promise<any> {
    try {
      const filter = { network: network, list_state: listState };
      const purchasedTime = new Date(purchasedAt.toNumber() * 1000);
      const update = {
        buyer_address: buyer,
        purchased_at: purchasedTime,
        purchase_receipt_address: purchaseReceipt,
      };
      const result = await this.ListingModel.updateOne(filter, update);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async updateCancelledAt(
    network: WalletAdapterNetwork,
    listState: string,
    cancelTime: Date,
  ): Promise<any> {
    try {
      const filter = { network: network, list_state: listState };
      const update = { cancelled_at: cancelTime };
      const result = await this.ListingModel.updateOne(filter, update);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getListing(
    network: WalletAdapterNetwork,
    listState: string,
  ): Promise<ListingDbDto> {
    try {
      const filter = { network: network, list_state: listState };
      const result = await this.ListingModel.findOne(filter);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getActiveListings(
    network: WalletAdapterNetwork,
    marketPlaceAddress: string,
  ): Promise<ListingDocument[]> {
    try {
      const filter = {
        $or: [
          { cancelled_at: { $exists: false } },
          { cancelled_at: { $eq: null } },
        ],
        network: network,
        marketplace_address: marketPlaceAddress,
        purchased_at: { $exists: false },
      };
      const result = await this.ListingModel.find(filter);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getSellerListings(
    network: WalletAdapterNetwork,
    marketPlaceAddress: string,
    seller: string,
  ): Promise<ListingDocument[]> {
    try {
      const filter = {
        network: network,
        marketplace_address: marketPlaceAddress,
        seller_address: seller,
      };
      const result = await this.ListingModel.find(filter);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getOrders(
    network: WalletAdapterNetwork,
    marketPlaceAddress: string,
    buyer: string,
  ): Promise<ListingDocument[]> {
    try {
      const filter = {
        network: network,
        marketplace_address: marketPlaceAddress,
        buyer_address: buyer,
      };
      const result = await this.ListingModel.find(filter);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async stats(filter: GetStatsDto): Promise<any> {
    try {
      const { network, marketplace_address, start_date } = filter;
      let { end_date } = filter;
      end_date = end_date ?? new Date();
      // add a day to the date, cause mongoose not feching today's data if date query added
      end_date.setDate(end_date.getDate() + 1);
      const createdAtQuery = start_date
        ? { $gte: start_date, $lte: end_date }
        : { $ne: null };

      const salesDetail = await this.ListingModel.aggregate([
        {
          $match: {
            network,
            marketplace_address,
            purchased_at: { $ne: null },
            created_at: createdAtQuery,
          },
        },
        {
          $group: {
            _id: 0,
            totalSales: { $sum: 1 },
            salesVolume: { $sum: '$price' },
          },
        },
      ]);

      const sellerDetails = await this.ListingModel.aggregate([
        {
          $match: {
            marketplace_address,
            created_at: createdAtQuery,
          },
        },
        { $group: { _id: null, seller: { $addToSet: '$seller_address' } } },
        { $unwind: '$seller' },
        { $group: { _id: 0, totalSellers: { $sum: 1 } } },
      ]);
      const listingDetails = await this.ListingModel.aggregate([
        {
          $match: {
            network,
            marketplace_address,
            cancelled_at: { $eq: null },
            created_at: createdAtQuery,
          },
        },
        {
          $group: {
            _id: 0,
            totalListings: { $sum: 1 },
            listedVolume: { $sum: '$price' },
          },
        },
      ]);

      // again revert back to exact date
      end_date.setDate(end_date.getDate() - 1);

      const result = {
        total_sales: salesDetail[0]?.totalSales ?? 0,
        sales_volume: salesDetail[0]?.salesVolume ?? 0,
        total_sellers: sellerDetails[0]?.totalSellers ?? 0,
        total_listings: listingDetails[0]?.totalListings ?? 0,
        listed_volume: listingDetails[0]?.listedVolume ?? 0,
        start_date: start_date ?? new Date(minDateOnSearch),
        end_date,
      };

      return result;
    } catch (err) {
      throw new Error(err);
    }
  }
}
