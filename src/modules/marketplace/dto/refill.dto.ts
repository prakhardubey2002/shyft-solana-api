import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class RefillMpDetails {
  readonly network: WalletAdapterNetwork;
  readonly marketplace_address: string;
  readonly refill_listings: boolean;
}
