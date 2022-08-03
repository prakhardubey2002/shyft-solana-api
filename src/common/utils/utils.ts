import { clusterApiUrl } from '@solana/web3.js';
import axios from 'axios';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { configuration } from '../configs/config';

const endpoint = {
  http: {
    devnet: 'http://api.devnet.solana.com',
    testnet: 'http://api.testnet.solana.com',
    'mainnet-beta': 'http://api.mainnet-beta.solana.com/'
  },
  https: {
    devnet: configuration().solDevnet,
    testnet: 'https://api.testnet.solana.com',
    'mainnet-beta': configuration().solMainnetBeta,
  }
};

export const Utility = {
  request: async function (uri: string): Promise<any> {
    try {
      const res = await axios.get(uri);
      return res.status === 200 ? res.data : {};
    } catch (error) {
      throw error;
    }
  },

  clusterUrl: function (network: WalletAdapterNetwork): string {
    try {
      switch (network) {
        case WalletAdapterNetwork.Devnet:
          return endpoint.https.devnet;
        case WalletAdapterNetwork.Mainnet:
          return endpoint.https['mainnet-beta'];
        default:
          return clusterApiUrl(network);
      }
    } catch (error) {
      throw error;
    }
  },
};
