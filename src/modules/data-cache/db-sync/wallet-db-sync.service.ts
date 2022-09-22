import { WalletAccessor } from 'src/dal/wallet-repo/wallet.accessor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Injectable } from '@nestjs/common';
import { Utility } from 'src/common/utils/utils';
import { ErrorCode } from 'src/common/utils/error-codes';

@Injectable()
export class WalletDbSyncService {
  constructor(private walletAccessor: WalletAccessor) {}

  async saveWalletInDB(network: WalletAdapterNetwork, walletAddress: string) {
    try {
      return await this.walletAccessor.update(network, walletAddress);
    } catch (error) {
      throw error;
    }
  }

  public async getTimeElapsedUntilLastSyncSec(
    network: WalletAdapterNetwork,
    walletAddress: string,
  ): Promise<number> {
    try {
      const result = await this.walletAccessor.getWallet(
        network,
        walletAddress,
      );

      return result
        ? Utility.getElapsedTimeSec(result?.updated_at)
        : ErrorCode.RECORD_NOT_FOUND;
    } catch (error) {
      throw Error(error);
    }
  }
}
