import { Injectable } from '@nestjs/common';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { newProgramErrorFrom } from 'src/core/program-error';
import { ListingRepo } from 'src/dal/listing-repo/listing-repo';
import { MarketplaceRepo } from 'src/dal/marketplace-repo/marketplace-repo';
import { MpBcDataFetcher } from './mp-bc-data-fetcher-service';

@Injectable()
export class MpRefillerService {
  constructor(
    private listingRepo: ListingRepo,
    private marketplaceRepo: MarketplaceRepo,
    private mpDataFetcher: MpBcDataFetcher,
  ) {}
  async refillMarketplace(network: WalletAdapterNetwork, mpAddress: string) {
    try {
      const mp = await this.mpDataFetcher.getMarketplace(network, mpAddress);
      this.marketplaceRepo.insert(mp);
    } catch (err) {
      throw newProgramErrorFrom(err, 'refill_marketplace_error');
    }
  }

  async refillMpListings(network: WalletAdapterNetwork, mpAddress: string) {
    try {
      const listings = await this.mpDataFetcher.getMarketplaceListings(network, mpAddress);
      listings.forEach((listing) => {
        this.listingRepo.insert(listing);
      });
    } catch (err) {
      throw newProgramErrorFrom(err, 'refill_marketplace_listings_error');
    }
  }
}
