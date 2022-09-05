import { AuctionHouse, findAuctionHousePda, findMetadataPda, Metaplex, token, toPublicKey } from '@metaplex-foundation/js';
import { getMint, Mint } from '@solana/spl-token';
import axios from 'axios';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { configuration } from '../configs/config';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { TokenListProvider } from '@solana/spl-token-registry';
import bs58 from 'bs58';
import { newProgramErrorFrom } from 'src/core/program-error';

const endpoint = {
  http: {
    devnet: 'http://api.devnet.solana.com',
    testnet: 'http://api.testnet.solana.com',
    'mainnet-beta': 'http://api.mainnet-beta.solana.com/',
  },
  https: {
    devnet: configuration().solDevnet,
    testnet: 'https://api.testnet.solana.com',
    'mainnet-beta': configuration().solMainnetBeta,
  },
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
      const pda = findMetadataPda(new PublicKey(mintAddress));
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

async function fetchInfoFromSplRegistry(
  network: WalletAdapterNetwork,
  mintAddress: string,
) {
  const tokens = await new TokenListProvider().resolve();
  const tokenInfoList = tokens.filterByClusterSlug(network).getList();
  const tokenData = tokenInfoList.find(
    (token) => token.address === mintAddress,
  );

  return {
    name: tokenData?.name,
    symbol: tokenData?.symbol,
    image: tokenData?.logoURI,
    description: '',
  };
}

const isValidUrl = (url: string) => {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
};

function attemptConnection(endpoint: string): Connection {
  try {
    const connection = new Connection(endpoint, {
      commitment: 'confirmed',
      disableRetryOnRateLimit: true,
    });
    return connection;
  } catch (error) {
    throw error;
  }
}

export const Utility = {
  connectRpc: function (network: WalletAdapterNetwork): Connection {
    try {
      return attemptConnection(Utility.clusterUrl(network));
    } catch (error) {
      console.log(error);
      //In case of an error, try fallback endpoint if mainnet
      try {
        if (network === WalletAdapterNetwork.Mainnet) {
          return attemptConnection(configuration().solFallBackMainnet);
        } else {
          throw Error(`RPC ${network} node not responding`);
        }
      } catch (error) {
        throw error;
      }
    }
  },

  request: async function (uri: string, timeout = 15000): Promise<any> {
    try {
      const abortController = new AbortController();
      setTimeout(() => {
        abortController.abort();
      }, timeout);
      const res = await axios.get(uri, { signal: abortController.signal });
      return res.status === 200 ? res.data : {};
    } catch (error) {
      throw error;
    }
  },

  requestFileFromUrl: async function (fileUrl: string): Promise<{ data: any, contentType: string }> {
    try {
      if (isValidUrl(fileUrl)) {
        const abortController = new AbortController();
        setTimeout(() => {
          abortController.abort();
        }, 12000);
        const { data, headers } = await axios.get(fileUrl, { responseType: 'stream', signal: abortController.signal });
        const contentType = headers['content-type'];
        return { data, contentType };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  isUriMatched: (cachedImageUri: string, imageUri: string): boolean => {
    if (!cachedImageUri) return false;
    const cdnUri = cachedImageUri.split('/').slice(4).join('/');
    const ext = cdnUri.split('.').pop();
    const cdnUriWithoutExt = cdnUri.replace(`.${ext}`, '');   
    if (cdnUriWithoutExt === imageUri) {
      return true;
    }
    return false;
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

  getElapsedTimeSec: function (date: Date): number {
    try {
      const diff = (new Date(Date.now()).getTime() - new Date(date?.toUTCString()).getTime()) / 1000;
      return diff;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  token: {
    getTokenInfo: async function (
      connection: Connection,
      network: WalletAdapterNetwork,
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
            description:
              metaInfo?.description ?? registryInfo?.description ?? '',
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

    getTokenSymbol: async function (
      network: WalletAdapterNetwork,
      tokenAddress: string,
    ): Promise<string> {
      let symbol = '';
      try {
        const connection = new Connection(clusterApiUrl(network), 'confirmed');
        const tokenInfo = await getMint(connection, toPublicKey(tokenAddress));
        const tokenResp = await Utility.token.getTokenInfo(connection, network, tokenInfo);
        symbol = tokenResp.symbol;
      } catch (err) {
        newProgramErrorFrom(err, "get_token_symbol_error").log();
      } finally {
        return symbol != "" ? symbol : "Token";
      }
    }
  },

  auctionHouse: {
    findAuctionHouse: async function (
      network: WalletAdapterNetwork,
      auctionHouseAddress: PublicKey,
    ): Promise<AuctionHouse> {
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      const metaplex = Metaplex.make(connection, { cluster: network });
      const auctionsClient = metaplex.auctions();
      const auctionHouse = await auctionsClient.findAuctionHouseByAddress(auctionHouseAddress).run();
      return auctionHouse;
    }
  },

  account: {
    getKeypair: function (privateKey: string): Keypair {
      const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
      return keypair;
    },

    getOrCreateAsscociatedAccountTx: async function (
      connection: Connection,
      payer: PublicKey,
      mint: PublicKey,
      owner: PublicKey,
      allowOwnerOffCurve = false,
      programId = TOKEN_PROGRAM_ID,
      associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
    ): Promise<{ associatedAccountAddress: PublicKey; createTx: Transaction }> {
      const associatedToken = await getAssociatedTokenAddress(
        mint,
        owner,
        allowOwnerOffCurve,
        programId,
        associatedTokenProgramId,
      );

      // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
      // Sadly we can't do this atomically.
      let account: Account;
      let transaction: Transaction;
      try {
        account = await getAccount(connection, associatedToken);
      } catch (error: unknown) {
        // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
        // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
        // TokenInvalidAccountOwnerError in this code path.
        if (
          error instanceof TokenAccountNotFoundError ||
          error instanceof TokenInvalidAccountOwnerError
        ) {
          // As this isn't atomic, it's possible others can create associated accounts meanwhile.
          try {
            transaction = new Transaction().add(
              createAssociatedTokenAccountInstruction(
                payer,
                associatedToken,
                owner,
                mint,
                programId,
                associatedTokenProgramId,
              ),
            );
          } catch (error: unknown) {
            // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
            // instruction error if the associated account exists already.
          }

          // Now this should always succeed
          account = await getAccount(connection, associatedToken);
        } else {
          throw error;
        }
      }

      return { associatedAccountAddress: associatedToken, createTx: transaction };
    },
  },
};
