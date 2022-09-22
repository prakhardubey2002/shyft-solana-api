import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet, WalletDocument } from './wallet.schema';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

@Injectable()
export class WalletAccessor {
  constructor(
    @InjectModel(Wallet.name)
    public wallet: Model<WalletDocument>,
  ) {}

  public async update(network: WalletAdapterNetwork, walletAddress: string) {
    try {
      const filter = { network: network, address: walletAddress };
      const walletObj = new Wallet(network, walletAddress);
      await this.wallet.updateOne(filter, walletObj, { upsert: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async getWallet(
    network: WalletAdapterNetwork,
    walletAddress: string,
  ): Promise<WalletDocument> {
    try {
      const filter = { network: network, address: walletAddress };
      return await this.wallet.findOne(filter);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
