import { WalletAccessor } from 'src/dal/wallet-repo/wallet.accessor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Injectable } from '@nestjs/common';
import { Utility } from 'src/common/utils/utils';
import { ErrorCode } from 'src/common/utils/error-codes';
import { OnEvent } from '@nestjs/event-emitter';
import { ResyncDomainsInDbEvent, SaveDomainsInDbEvent } from './db.events';
import { RemoteDataFetcherService } from '../remote-data-fetcher/data-fetcher.service';

@Injectable()
export class WalletDbSyncService {
  constructor(private walletAccessor: WalletAccessor, private dataFetcher: RemoteDataFetcherService) {}

  async saveWalletInDB(network: WalletAdapterNetwork, walletAddress: string) {
    try {
      return await this.walletAccessor.update(network, walletAddress);
    } catch (error) {
      throw error;
    }
  }

  public async getTimeElapsedUntilLastSyncSec(network: WalletAdapterNetwork, walletAddress: string): Promise<number> {
    try {
      const lastUpdatedTime = await this.walletAccessor.getLastUpdatedTimeOfNfts(network, walletAddress);
      return lastUpdatedTime ? Utility.getElapsedTimeSec(lastUpdatedTime) : ErrorCode.RECORD_NOT_FOUND;
    } catch (error) {
      throw Error(error);
    }
  }

  public async getTimeElapsedUntilLastSyncDomainsSec(network: WalletAdapterNetwork, wallet: string): Promise<number> {
    try {
      const lastUpdatedTime = await this.walletAccessor.getLastUpdatedTimeOfDomains(network, wallet);
      return lastUpdatedTime ? Utility.getElapsedTimeSec(lastUpdatedTime) : ErrorCode.RECORD_NOT_FOUND;
    } catch (error) {
      throw Error(error);
    }
  }

  @OnEvent('resync.wallet.domains', { async: true })
  private async resyncWalletDomains(event: ResyncDomainsInDbEvent): Promise<void> {
    const domains = await this.dataFetcher.fetchDomainsFromWallet(event);
    const saveDomainsEvent = new SaveDomainsInDbEvent(event.network, event.wallet, domains);
    await this.handleWalletDomainsSave(saveDomainsEvent);
  }

  @OnEvent('save.wallet.domains', { async: true })
  private async handleWalletDomainsSave(event: SaveDomainsInDbEvent): Promise<void> {
    const { network, wallet, domains } = event;
    await this.walletAccessor.updateDomains(network, wallet, domains);
  }
}
