import { DateTime } from '@metaplex-foundation/js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { ObjectId } from 'mongoose';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';
import { NftData } from '../remote-data-fetcher/dto/data-fetcher.dto';

export class NftCreationEvent {
  constructor(
    tokenAddress: string,
    network: WalletAdapterNetwork,
    apiKeyId: ObjectId,
  ) {
    this.tokenAddress = tokenAddress;
    this.network = network;
    this.apiKeyId = apiKeyId;
  }

  tokenAddress: string;
  network: WalletAdapterNetwork;
  apiKeyId: ObjectId;
}

export class NftWalletSyncEvent {
  constructor(
    network: WalletAdapterNetwork,
    walletAddress: string,
    updateAuthority: string,
    dbNfts: NftInfo[],
  ) {
    this.walletAddress = walletAddress;
    this.network = network;
    this.updateAuthority = updateAuthority;
    this.dbNfts = dbNfts;
  }

  syncAll: boolean;
  syncDelete: boolean;
  dbNfts: NftInfo[];
  updateAuthority: string;
  walletAddress: string;
  network: WalletAdapterNetwork;
}

export class SaveNftsInDbEvent {
  constructor(
    network: WalletAdapterNetwork,
    walletAddress: string,
    nfts: NftData[],
  ) {
    this.network = network;
    this.walletAddress = walletAddress;
    this.nfts = nfts;
  }

  network: WalletAdapterNetwork;
  walletAddress: string;
  nfts: NftData[];
}

export class NftReadByCreatorEvent {
  constructor(
    creator_wallet_address: string,
    network: WalletAdapterNetwork,
    nfts?: NftInfo[],
  ) {
    this.creator = creator_wallet_address;
    this.network = network;
    this.nfts = nfts;
  }

  creator: string;
  network: WalletAdapterNetwork;
  nfts?: NftInfo[];
}

export class NftDeleteEvent {
  constructor(tokenAddress: string, network: WalletAdapterNetwork) {
    this.tokenAddress = tokenAddress;
    this.network = network;
  }
  tokenAddress: string;
  network: WalletAdapterNetwork;
}

export class NftSyncEvent {
  constructor(tokenAddress: string, network: WalletAdapterNetwork) {
    this.tokenAddress = tokenAddress;
    this.network = network;
  }

  tokenAddress: string;
  network: WalletAdapterNetwork;
}

export class NftCacheEvent {
  constructor(metadataImageUri: string, mint: string, network: string) {
    this.metadataImageUri = metadataImageUri;
    this.mint = mint;
    this.network = network;
  }

  mint: string;
  network: string;
  metadataImageUri: string;
}

export class MarketplaceCreationEvent {
  constructor(
    network: WalletAdapterNetwork,
    address: string,
    authority: string,
    currencyAddress: string,
    feePayer: string,
    feeRecipientAccount: string,
    feeRecipient: string,
    treasuryAddress: string,
    creator: string,
    transactionFee: number,
    currencySymbol: string,
    apiKeyId: ObjectId,
    canChangePrice?: boolean,
    requireSignOff?: boolean,
  ) {
    this.network = network;
    this.address = address;
    this.authority = authority;
    this.currencyAddress = currencyAddress;
    this.feePayer = feePayer;
    this.treasuryAddress = treasuryAddress;
    this.feeRecipient = feeRecipient;
    this.feeRecipientAccount = feeRecipientAccount;
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
  feeRecipient: string;
  feeRecipientAccount: string;
  treasuryAddress: string;
  creator: string;
  transactionFee: number;
  canChangeSalePrice: boolean;
  requiresSignOff: boolean;
}

export class UpdateMarketplaceEvent {
  constructor(
    address: string,
    currencyAddress: string,
    currencySymbol: string,
    feePayer: string,
    feeRecipient: string,
    feeRecipientAccount: string,
    transactionFee: number,
    authority: string,
    creator?: string,
    apiKeyId?: ObjectId,
    canChangePrice?: boolean,
    requireSignOff?: boolean,
  ) {
    this.address = address;
    this.currencyAddress = currencyAddress;
    this.currencySymbol = currencySymbol;
    this.feePayer = feePayer;
    this.feeRecipient = feeRecipient;
    this.transactionFee = transactionFee;
    this.authority = authority;
    this.feeRecipientAccount = feeRecipientAccount;
    if (canChangePrice !== undefined) {
      this.canChangeSalePrice = canChangePrice;
    }
    if (requireSignOff !== undefined) {
      this.requiresSignOff = requireSignOff;
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
  feeRecipientAccount: string;
  transactionFee: number;
  canChangeSalePrice: boolean;
  requiresSignOff: boolean;
  apiKeyId?: ObjectId;
  creator?: string;
}

export class ListingCreatedEvent {
  constructor(
    ts: string,
    mp: string,
    price: number,
    nft: string,
    seller: string,
    apiKeyId: ObjectId,
    network: WalletAdapterNetwork,
    receipt: string,
    createdAt: DateTime,
    symbol: string,
  ) {
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
  constructor(
    listState: string,
    buyerAddress: string,
    nftAddress: string,
    network: WalletAdapterNetwork,
    purchasedAt: DateTime,
    purchaseReceipt?: string,
  ) {
    this.listState = listState;
    this.buyerAddress = buyerAddress;
    this.nftAddress = nftAddress;
    this.network = network;
    this.purchasedAt = purchasedAt;
    if (purchaseReceipt !== undefined) {
      this.purchaseReceipt = purchaseReceipt;
    }
  }

  network: WalletAdapterNetwork;
  listState: string;
  buyerAddress: string;
  nftAddress: string;
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
  constructor(
    network: WalletAdapterNetwork,
    address: string,
    apiKeyId: ObjectId,
    feeRecipient: string,
  ) {
    this.network = network;
    this.address = address;
    this.apiKeyId = apiKeyId;
    this.feeRecipient = feeRecipient;
  }
  network: WalletAdapterNetwork;
  address: string;
  apiKeyId: ObjectId;
  feeRecipient: string;
}

export type MarketplaceUpdateInitiationEvent = MarketplaceInitiationEvent;

export class ListingInitiationEvent {
  constructor(
    network: WalletAdapterNetwork,
    listState: PublicKey,
    auctionHouse: PublicKey,
    apiKeyId: ObjectId,
  ) {
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
  constructor(
    network: WalletAdapterNetwork,
    nftAddress: string,
    listState: PublicKey,
    purchaseReceipt: PublicKey,
  ) {
    this.network = network;
    this.nftAddress = nftAddress;
    this.listState = listState;
    this.bidState = purchaseReceipt;
  }
  network: WalletAdapterNetwork;
  nftAddress: string;
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
