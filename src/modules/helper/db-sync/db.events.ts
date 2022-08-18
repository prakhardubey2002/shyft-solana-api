import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ObjectId } from 'mongoose';

export class NftCreationEvent {
  constructor(tokenAddress: string, network: WalletAdapterNetwork, apiKeyId: ObjectId) {
    this.tokenAddress = tokenAddress;
    this.network = network;
    this.apiKeyId = apiKeyId;
  }

  tokenAddress: string;
  network: WalletAdapterNetwork;
  apiKeyId: ObjectId;
}

export class NftReadInWalletEvent {
  constructor(walletAddress: string, network: WalletAdapterNetwork, updateAuthority: string) {
    this.walletAddress = walletAddress;
    this.network = network;
    this.updateAuthority = updateAuthority;
  }

  updateAuthority: string;
  walletAddress: string;
  network: WalletAdapterNetwork;
}

export class NftUpdateEvent {
  constructor(tokenAddress: string, network: WalletAdapterNetwork) {
    this.tokenAddress = tokenAddress;
    this.network = network;
  }

  tokenAddress: string;
  network: WalletAdapterNetwork;
}

export class NftDeleteEvent {
  constructor(tokenAddress: string, network: WalletAdapterNetwork) {
    this.tokenAddress = tokenAddress;
    this.network = network;
  }
  tokenAddress: string;
  network: WalletAdapterNetwork;
}

export class NftReadEvent {
  constructor(tokenAddress: string, network: WalletAdapterNetwork) {
    this.tokenAddress = tokenAddress;
    this.network = network;
  }

  tokenAddress: string;
  network: WalletAdapterNetwork;
}

export class MarketplaceCreationEvent {
  constructor(network: WalletAdapterNetwork, address: string, currency: string, apiKeyId: ObjectId) {
    this.network = network;
    this.address = address;
    this.currency = currency;
    this.apiKeyId = apiKeyId;
  }
  network: WalletAdapterNetwork;
  address: string;
  currency: string;
  apiKeyId: ObjectId;
}

export class ListingCreatedEvent {
  constructor(ts: string, mp: string, price: number, nft: string, seller: string, apiKeyId: ObjectId, network: WalletAdapterNetwork) {
    this.listState = ts;
    this.apiKeyId = apiKeyId;
    this.marketplaceAddress = mp;
    this.price = price;
    this.nftAddress = nft;
    this.sellerAddress = seller;
    this.network = network;
  }

  network: WalletAdapterNetwork;
  listState: string;
  marketplaceAddress: string;
  price: number;
  nftAddress: string;
  sellerAddress: string;
  apiKeyId: ObjectId;
}

export class ListingSoldEvent {
  constructor(ts: string, ba: string, network: WalletAdapterNetwork) {
    this.listState = ts;
    this.buyerAddress = ba;
    this.network = network;
    this.purchasedAt = new Date();
  }

  network: WalletAdapterNetwork;
  listState: string;
  buyerAddress: string;
  purchasedAt: Date;
}

export class ListingCancelledEvent {
  constructor(ts: string, network: WalletAdapterNetwork, cancelledAt: Date) {
    this.listState = ts;
    this.network = network;
    this.cancelledAt = cancelledAt;
  }

  network: WalletAdapterNetwork;
  listState: string;
  cancelledAt: Date;
}