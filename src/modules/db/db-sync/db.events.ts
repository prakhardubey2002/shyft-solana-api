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
  constructor(tokenAddress: string) {
    this.tokenAddress = tokenAddress;
  }
  tokenAddress: string;
}

export class NftReadEvent {
  constructor(tokenAddress: string, network: WalletAdapterNetwork) {
    this.tokenAddress = tokenAddress;
    this.network = network;
  }

  tokenAddress: string;
  network: WalletAdapterNetwork;
}
