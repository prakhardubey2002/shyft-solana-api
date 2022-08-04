import { findMetadataPda } from '@metaplex-foundation/js';
import { Mint } from '@solana/spl-token';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { Connection } from '@solana/web3.js';
import { Network } from 'src/dto/netwotk.dto';
import { configuration } from '../configs/config';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { TokenListProvider } from '@solana/spl-token-registry';

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

interface TokenResponse {
  name: string;
  symbol: string;
  description: string;
  image: string;
  mint_authority: string;
  freeze_authority: string;
  current_supply: number;
  address: string;
  decimals: number;
}

async function fetchInfoFromMeta(connection: Connection, mintAddress: string) {
  if (mintAddress) {
    //Take name and symbol from on chain
    let uriData, meta;
    try {
      //Get metadata
      const pda = findMetadataPda (new PublicKey (mintAddress));
      meta = await Metadata.load(connection, pda);
      if (meta?.data?.data?.uri) {
        uriData = await Utility.request(meta?.data?.data?.uri);
      }
    } catch (error) {
      console.log('metadata not available for ', mintAddress);
    } finally {
      return {
        name: meta?.data?.data?.name,
        symbol: meta?.data?.data?.symbol,
        image: uriData?.image,
        description: uriData?.description,
      };
    }
  }
}

async function fetchInfoFromSplRegistry(network: Network, mintAddress: string) {
  const tokens = await new TokenListProvider().resolve();
  const tokenInfoList = tokens.filterByClusterSlug(network).getList();
  const tokenData = tokenInfoList.find((token) => token.address === mintAddress);

  return {
    name: tokenData?.name,
    symbol: tokenData?.symbol,
    image: tokenData?.logoURI,
    description: '',
  };
}

export const Utility = {
  request: async function (uri: string): Promise<any> {
    try {
      const res = await axios.get(uri);
      return res.status === 200 ? res.data : {};
    } catch (error) {
      throw error;
    }
  },

  clusterUrl: function (network: Network): string {
    try {
      switch (network) {
        case Network.devnet:
          return endpoint.https.devnet;
        case Network.mainnet:
          return endpoint.https['mainnet-beta'];
        default:
          return clusterApiUrl(network);
      }
    } catch (error) {
      throw error;
    }
  },

  token: {
    getTokenInfo: async function (
      connection: Connection,
      network: Network,
      mint: Mint,
    ): Promise<TokenResponse> {
      if (mint) {
        const mintAddr = mint?.address?.toBase58();
        let metaInfo, registryInfo;
        try {
          metaInfo = await fetchInfoFromMeta(connection, mintAddr);
          registryInfo = await fetchInfoFromSplRegistry(network, mintAddr);
        } catch (error) {
          console.log(error);
        } finally {
          const decimalAmt = Math.pow(10, mint.decimals);
          return {
            name: metaInfo?.name ?? registryInfo?.name ?? '',
            symbol: metaInfo?.symbol ?? registryInfo?.symbol ?? '',
            description: metaInfo?.description ?? registryInfo?.description ?? '',
            image: metaInfo?.image ?? registryInfo?.image ?? '',
            address: mint.address?.toBase58(),
            mint_authority: mint?.mintAuthority?.toBase58(),
            freeze_authority: mint?.freezeAuthority?.toBase58() ?? '',
            current_supply: Number(mint?.supply) / decimalAmt,
            decimals: mint?.decimals,
          };
        }
      }
    },
  },
};
