import { DateTime } from '@metaplex-foundation/js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { ObjectId } from 'mongoose';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';

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

export class NftReadByCreatorEvent {
  constructor(creator_wallet_address: string, network: WalletAdapterNetwork, nfts?: NftInfo[]) {
    this.creator = creator_wallet_address;
    this.network = network;
    this.nfts = nfts;
  }

  creator: string;
  network: WalletAdapterNetwork;
  nfts?: NftInfo[];
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

export class NftCacheEvent {
  constructor(metadataImageUri: string, cachedImageUri?: string) {
    this.metadataImageUri = metadataImageUri;
    this.cachedImageUri = cachedImageUri;
  }

  metadataImageUri: string;
  cachedImageUri: string;
}

export class MarketplaceCreationEvent {
  constructor(network: WalletAdapterNetwork, address: string, authority: string, currencyAddress: string, feePayer: string, feeReceipient: string, treasuryAddress: string, creator: string, transactionFee: number, currencySymbol: string, apiKeyId: ObjectId, canChangePrice?: boolean, requireSignOff?: boolean) {
    this.network = network;
    this.address = address;
    this.authority = authority;
    this.currencyAddress = currencyAddress;
    this.feePayer = feePayer;
    this.treasuryAddress = treasuryAddress;
    this.feeReceipient = feeReceipient;
    this.creator = creator;
    this.transactionFee = transactionFee;
    this.apiKeyId = apiKeyId;
    this.currencySymbol = currencySymbol;
    this.canChangeSalePrice = canChangePrice ? canChangePrice : false;
    this.requiresSignOff = requireSignOff ? requireSignOff : false;
  }
  network: WalletAdapterNetwork;
  address: string;
  authority: string;
  currencyAddress: string;
  currencySymbol: string;
  apiKeyId: ObjectId;
  feePayer: string;
  feeReceipient: string;
  treasuryAddress: string;
  creator: string;
  transactionFee: number;
  canChangeSalePrice: boolean;
  requiresSignOff: boolean;
}

export class UpdateMarketplaceEvent {
  constructor(address: string, currencyAddress: string, currencySymbol: string, feePayer: string, feeRecipient: string, transactionFee: number, authority: string, creator?: string, apiKeyId?: ObjectId, canChangePrice?: boolean, requireSignOff?: boolean) {
    this.address = address;
    this.currencyAddress = currencyAddress;
    this.currencySymbol = currencySymbol;
    this.feePayer = feePayer;
    this.feeRecipient = feeRecipient;
    this.transactionFee = transactionFee;
    this.authority = authority;
    if (canChangePrice !== undefined) {
      this.canChangeSalePrice = canChangePrice
    }
    if (requireSignOff !== undefined) {
      this.requiresSignOff = requireSignOff
    }
    if (apiKeyId !== undefined) {
      this.apiKeyId = apiKeyId;
    }
    if (creator !== undefined) {
      this.creator = creator;
    }
  }

  address: string;
  currencyAddress: string;
  currencySymbol: string;
  authority: string;
  feePayer: string;
  feeRecipient: string;
  transactionFee: number;
  canChangeSalePrice: boolean;
  requiresSignOff: boolean;
  apiKeyId?: ObjectId;
  creator?: string;
}

export class ListingCreatedEvent {
  constructor(ts: string, mp: string, price: number, nft: string, seller: string, apiKeyId: ObjectId, network: WalletAdapterNetwork, receipt: string, createdAt: DateTime, symbol: string) {
    this.listState = ts;
    this.apiKeyId = apiKeyId;
    this.marketplaceAddress = mp;
    this.price = price;
    this.nftAddress = nft;
    this.sellerAddress = seller;
    this.network = network;
    this.receipt = receipt;
    this.createdAt = createdAt;
    this.currency_symbol = symbol;
  }

  network: WalletAdapterNetwork;
  listState: string;
  marketplaceAddress: string;
  price: number;
  nftAddress: string;
  sellerAddress: string;
  apiKeyId: ObjectId;
  receipt: string;
  createdAt: DateTime;
  currency_symbol: string;
}

export class ListingSoldEvent {
  constructor(ts: string, ba: string, network: WalletAdapterNetwork, purchasedAt: DateTime, purchaseReceipt?: string) {
    this.listState = ts;
    this.buyerAddress = ba;
    this.network = network;
    this.purchasedAt = purchasedAt;
    if (purchaseReceipt !== undefined) {
      this.purchaseReceipt = purchaseReceipt;
    }
  }

  network: WalletAdapterNetwork;
  listState: string;
  buyerAddress: string;
  purchasedAt: DateTime;
  purchaseReceipt?: string;
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

export class MarketplaceInitiationEvent {
  constructor(network: WalletAdapterNetwork, address: string, apiKeyId: ObjectId) {
    this.network = network;
    this.address = address;
    this.apiKeyId = apiKeyId;
  }
  network: WalletAdapterNetwork;
  address: string;
  apiKeyId: ObjectId;
}

export type MarketplaceUpdateInitiationEvent = MarketplaceInitiationEvent;

export class ListingInitiationEvent {
  constructor(network: WalletAdapterNetwork, listState: PublicKey, auctionHouse: PublicKey, apiKeyId: ObjectId) {
    this.network = network;
    this.listState = listState;
    this.apiKeyId = apiKeyId;
    this.auctionHouseAddress = auctionHouse;
  }
  network: WalletAdapterNetwork;
  listState: PublicKey;
  apiKeyId: ObjectId;
  auctionHouseAddress: PublicKey;
}

export class SaleInitiationEvent {
  constructor(network: WalletAdapterNetwork, listState: PublicKey, purchaseReceipt: PublicKey) {
    this.network = network;
    this.listState = listState;
    this.bidState = purchaseReceipt;
  }
  network: WalletAdapterNetwork;
  bidState: PublicKey;
  listState: PublicKey;
}

export class UnlistInitiationEvent {
  constructor(network: WalletAdapterNetwork, listState: PublicKey) {
    this.network = network;
    this.listState = listState;
  }
  network: WalletAdapterNetwork;
  listState: PublicKey;
}