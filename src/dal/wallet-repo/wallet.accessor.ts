import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet, WalletDocument, DomainType } from './wallet.schema';
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
      const walletObj = new Wallet({ network, walletAddress, lastNftsSync: new Date() });
      await this.wallet.updateOne(filter, walletObj, { upsert: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async getWallet(network: WalletAdapterNetwork, walletAddress: string): Promise<WalletDocument> {
    try {
      const filter = { network: network, address: walletAddress };
      return await this.wallet.findOne(filter);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async updateDomains(network: WalletAdapterNetwork, walletAddress: string, domains: DomainType[]) {
    try {
      const filter = { network, address: walletAddress };
      const domainObj = new Wallet({ network, walletAddress, domains, lastDomainsSync: new Date() });
      await this.wallet.updateOne(filter, domainObj, { upsert: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async getDomainsFromWallet(network: WalletAdapterNetwork, walletAddress: string): Promise<DomainType[]> {
    try {
      const filter = { network, address: walletAddress };
      return (await this.wallet.findOne(filter)).domains ?? [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getLastUpdatedTimeOfNfts(
    network: WalletAdapterNetwork,
    walletAddress: string,
  ): Promise<Date | undefined> {
    try {
      const filter = { network, address: walletAddress };
      const result = await this.wallet.findOne(filter).select('last_nfts_sync');
      return result?.last_nfts_sync;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getLastUpdatedTimeOfDomains(
    network: WalletAdapterNetwork,
    walletAddress: string,
  ): Promise<Date | undefined> {
    try {
      const filter = { network, address: walletAddress };
      const result = await this.wallet.findOne(filter).select('last_domains_sync');
      return result?.last_domains_sync;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
