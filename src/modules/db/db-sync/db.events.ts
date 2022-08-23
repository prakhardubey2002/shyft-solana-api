import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
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
