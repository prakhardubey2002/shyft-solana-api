import { HttpStatus } from '@nestjs/common';
import { AuctionHouse, findMetadataPda, Metadata, Metaplex, Nft } from '@metaplex-foundation/js';
import { createTransferCheckedInstruction, getMint, Mint } from '@solana/spl-token';
import axios from 'axios';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
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
import { Metadata as DepricatedMetadata } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { TokenInfo } from '@solana/spl-token-registry';
import bs58 from 'bs58';
import { newProgramError, newProgramErrorFrom, ProgramError } from 'src/core/program-error';
import { createUpdateMetadataAccountV2Instruction, DataV2 } from '@metaplex-foundation/mpl-token-metadata';
import { Globals } from 'src/globals';

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

export interface TokenUiInfo {
  name: string;
  symbol: string;
  image: string;
}

export interface TokenResponse extends TokenUiInfo {
  mint_authority: string;
  freeze_authority: string;
  current_supply: number;
  address: string;
  decimals: number;
}

export interface ServiceCharge {
  receiver: string;
  token?: string;
  amount: number;
}

async function fetchInfoFromMeta(connection: Connection, mintAddress: string) {
  if (mintAddress) {
    //Take name and symbol from on chain
    let uriData, meta;
    const tokenInfo = {};
    try {
      //Get metadata
      const pda = findMetadataPda(new PublicKey(mintAddress));
      meta = await DepricatedMetadata.load(connection, pda);
      tokenInfo['name'] = meta?.data?.data?.name;
      tokenInfo['symbol'] = meta?.data?.data?.symbol;

      if (meta?.data?.data?.uri) {
        uriData = await Utility.request(meta?.data?.data?.uri);
        tokenInfo['image'] = uriData?.image;
      }
    } catch (error) {
      throw error;
    } finally {
      return tokenInfo;
    }
  }
}

async function fetchInfoFromTokenList(mintAddress: string, tokenInfoList: TokenInfo[]) {
  if (tokenInfoList?.length) {
    const tokenData = tokenInfoList.find((token) => token.address === mintAddress);
    if (!tokenData) {
      throw new Error('No token data found');
    }
    return {
      name: tokenData?.name,
      symbol: tokenData?.symbol,
      image: tokenData?.logoURI,
    };
  }
  throw new Error('No token data found');
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
      const res = await axios.get(uri, { timeout: timeout });
      return res.status === 200 ? res.data : {};
    } catch (error) {
      throw error;
    }
  },

  downloadFile: async function (fileUrl: string, timeout = 15000): Promise<{ data: any; contentType: string }> {
    try {
      if (isValidUrl(fileUrl)) {
        const { data, headers } = await axios.get(fileUrl, {
          responseType: 'stream',
          timeout: timeout,
        });
        const contentType = headers['content-type'];
        return { data, contentType };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  isUriMatched: (metadataImageUri: string, cachedFileUri?: string): boolean => {
    if (!cachedFileUri) return false;
    const cdnUri = cachedFileUri.split('/').slice(4).join('/');
    const ext = cdnUri.split('.').pop();
    const cdnUriWithoutExt = decodeURIComponent(cdnUri.replace(`.${ext}`, ''));
    return cdnUriWithoutExt === metadataImageUri;
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
      const diff = Math.abs((new Date().getTime() - date.getTime()) / 1000);
      return diff;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  transaction: {
    getMemoTx: function (publicKey: PublicKey, message: string): TransactionInstruction {
      return new TransactionInstruction({
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(message, 'utf-8'),
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      });
    },
  },

  token: {
    getTokenInfo: async function (connection: Connection, mint: Mint): Promise<TokenResponse> {
      if (mint) {
        const mintAddr = mint?.address?.toBase58();
        try {
          const tokeninfo = await Utility.token.getTokenUiInfoFromRegistryOrMeta(
            connection,
            mintAddr,
            Globals.getSolMainnetTokenList(),
          );
          const decimalAmt = Math.pow(10, mint.decimals);
          return {
            ...tokeninfo,
            address: mint?.address?.toBase58(),
            mint_authority: mint?.mintAuthority?.toBase58(),
            freeze_authority: mint?.freezeAuthority?.toBase58() ?? '',
            current_supply: Number(mint?.supply) / decimalAmt ?? 0,
            decimals: mint?.decimals,
          };
        } catch (error) {
          console.log(`error fetching token metadata`);
        }
      }
    },

    getTokenUiInfoFromRegistryOrMeta: async function (
      connection: Connection,
      mintAddr: string,
      tokenInfoList: TokenInfo[],
    ): Promise<TokenUiInfo> {
      let metaInfo, registryInfo;
      try {
        registryInfo = await fetchInfoFromTokenList(mintAddr, tokenInfoList);
      } catch (error) {
        metaInfo = await fetchInfoFromMeta(connection, mintAddr);
      } finally {
        return {
          name: metaInfo?.name ?? registryInfo?.name ?? 'Unknown Token',
          symbol: metaInfo?.symbol ?? registryInfo?.symbol ?? 'Token',
          image: metaInfo?.image ?? registryInfo?.image ?? '',
        };
      }
    },

    getMultipleTokenInfo: async function (connection: Connection, mintAddresses: string[]): Promise<TokenUiInfo[]> {
      if (mintAddresses && mintAddresses?.length) {
        const response = [];
        for (const index in mintAddresses) {
          const mintAddr = mintAddresses[index];
          try {
            response.push(
              Utility.token.getTokenUiInfoFromRegistryOrMeta(connection, mintAddr, Globals.getSolMainnetTokenList()),
            );
          } catch (error) {
            console.log('token info not found for: ', mintAddr);
          }
        }
        const resolvedPromises = await Promise.all(response);
        const result = [];
        resolvedPromises?.forEach((data) => {
          result.push(data);
        });
        return result;
      }
    },

    getTokenSymbol: async function (network: WalletAdapterNetwork, tokenAddress: string): Promise<string> {
      let symbol = 'Token';
      try {
        const connection = new Connection(clusterApiUrl(network), 'confirmed');
        const tokenInfo = await Utility.token.getTokenUiInfoFromRegistryOrMeta(
          connection,
          tokenAddress,
          Globals.getSolMainnetTokenList(),
        );
        symbol = tokenInfo.symbol;
      } catch (err) {
        newProgramErrorFrom(err, 'get_token_symbol_error').log();
      } finally {
        return symbol;
      }
    },

    transferTokenTransaction: async (
      connection: Connection,
      tx: Transaction,
      tokenAddress: PublicKey,
      amount: number,
      receiver: PublicKey,
      feePayer: PublicKey,
    ): Promise<Transaction> => {
      try {
        const tokenInfo = await getMint(connection, tokenAddress);

        if (tokenInfo.isInitialized) {
          const fromAccount = await getAssociatedTokenAddress(
            tokenAddress,
            feePayer,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
          );
          const amtToTransfer = Math.pow(10, tokenInfo.decimals) * amount;
          const { associatedAccountAddress: toAccount, createTx } =
            await Utility.account.getOrCreateAsscociatedAccountTx(
              connection,
              feePayer,
              tokenAddress,
              new PublicKey(receiver),
            );
          if (createTx) {
            tx.add(createTx);
          }
          tx.add(
            createTransferCheckedInstruction(
              fromAccount,
              tokenAddress,
              toAccount,
              feePayer,
              amtToTransfer,
              tokenInfo.decimals,
            ),
          );
        }
        return tx;
      } catch (err) {
        if (err instanceof TokenAccountNotFoundError) {
          throw newProgramError(
            err.name,
            HttpStatus.BAD_REQUEST,
            'token account passed not found',
            err.message,
            'Utils_Utility_token_transferTokenTransaction',
            {},
            err.stack,
          );
        } else {
          throw newProgramError(
            err.name,
            HttpStatus.BAD_REQUEST,
            'invalid_input',
            err.message,
            'Utils_Utility_token_transferTokenTransaction',
            {},
            err.stack,
          );
        }
      }
    },
  },

  auctionHouse: {
    findAuctionHouse: async function (
      network: WalletAdapterNetwork,
      auctionHouseAddress: PublicKey,
    ): Promise<AuctionHouse> {
      const connection = new Connection(Utility.clusterUrl(network), 'confirmed');
      const metaplex = Metaplex.make(connection, { cluster: network });
      const auctionsClient = metaplex.auctions();
      const auctionHouse = await auctionsClient.findAuctionHouseByAddress(auctionHouseAddress).run();
      return auctionHouse;
    },
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        account = await getAccount(connection, associatedToken);
      } catch (error: unknown) {
        // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
        // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
        // TokenInvalidAccountOwnerError in this code path.
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
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
        } else {
          throw error;
        }
      }

      return {
        associatedAccountAddress: associatedToken,
        createTx: transaction,
      };
    },

    addSeviceChargeOnTransaction: async (
      connection: Connection,
      tx: Transaction,
      serviceCharge: ServiceCharge,
      feePayer: PublicKey,
    ): Promise<Transaction> => {
      try {
        if (!(serviceCharge.receiver && serviceCharge.amount)) {
          throw newProgramError(
            'validation_error',
            HttpStatus.BAD_REQUEST,
            'Please provide service_charge in proper format',
            '',
            'addSeviceChargeOnTransaction',
            {
              serviceCharge,
            },
          );
        }
        if (serviceCharge.token) {
          const transaction = await Utility.token.transferTokenTransaction(
            connection,
            tx,
            new PublicKey(serviceCharge.token),
            serviceCharge.amount,
            new PublicKey(serviceCharge.receiver),
            feePayer,
          );
          return transaction;
        } else {
          tx.add(
            SystemProgram.transfer({
              fromPubkey: feePayer,
              toPubkey: new PublicKey(serviceCharge.receiver),
              lamports: LAMPORTS_PER_SOL * serviceCharge.amount,
            }),
          );
        }
        return tx;
      } catch (error) {
        throw error;
      }
    },
  },

  s3: {
    getS3ImgKey: function (fileName: string) {
      const encodedName = encodeURIComponent(fileName);
      const key = `img/${encodedName}`;
      return key;
    },

    getImgCdnUrl: function (key: string) {
      const cdnUrl = `https://${configuration().s3Bucket}/${key}`;
      return cdnUrl;
    },
  },

  nft: {
    getNftAuthorityUpdateInstruction: async (
      connection: Connection,
      tokenAddress: PublicKey,
      nftOwnerAddress: PublicKey,
      newUpdateAuthority: PublicKey,
    ): Promise<TransactionInstruction> => {
      try {
        const nft = await getNftToUpdate();
        const pda = await DepricatedMetadata.getPDA(tokenAddress);
        return createUpdateMetadataAccountV2Instruction(
          {
            metadata: pda,
            updateAuthority: nft.updateAuthorityAddress,
          },
          {
            updateMetadataAccountArgsV2: {
              data: {
                name: nft.name,
                symbol: nft.symbol,
                uri: nft.uri,
                sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
                creators: nft.creators,
                collection: nft.collection,
                uses: nft.uses,
              } as DataV2,
              updateAuthority: newUpdateAuthority,
              primarySaleHappened: nft.primarySaleHappened,
              isMutable: nft.isMutable,
            },
          },
        );
      } catch (err) {
        throw newProgramErrorFrom(err);
      }

      async function getNftToUpdate() {
        const nft = await getNft();
        isUpdateAccess(nft);
        return nft;
      }

      function isUpdateAccess(nft: any) {
        const isUpdateAccess = nftOwnerAddress.toBase58() === nft.updateAuthorityAddress.toBase58();
        if (!isUpdateAccess) {
          throw newProgramError(
            'no_update_authority',
            HttpStatus.FORBIDDEN,
            'NFT owner does not have the update authority needed to update NFT',
            '',
            '',
            {
              nftUpdateAuthority: nft.updateAuthorityAddress,
              nftOwnerAddress: nftOwnerAddress,
            },
          );
        }
      }

      async function getNft() {
        const metaplex = Metaplex.make(connection);
        const nft = await metaplex.nfts().findByMint(tokenAddress).run();
        return nft;
      }
    },

    getNftOwner: async (connection: Connection, tokenAddress: PublicKey): Promise<string> => {
      if (!tokenAddress) {
        throw new ProgramError(
          'invalid_token_address',
          HttpStatus.BAD_REQUEST,
          'Please provide any public or private key',
          '',
          'utils.nfts.getNftOwner',
        );
      }
      const largestAcc = await connection.getTokenLargestAccounts(new PublicKey(tokenAddress));

      if (largestAcc?.value.length) {
        const ownerInfo = <any>await connection.getParsedAccountInfo(largestAcc?.value[0]?.address);
        return ownerInfo.value?.data?.parsed?.info?.tokenAmount.uiAmount > 0
          ? ownerInfo.value?.data?.parsed?.info?.owner
          : 'None';
      }

      return 'None';
    },

    nftToMetadataTypeCast(nft: Nft): Metadata {
      return {
        model: 'metadata',
        address: nft.metadataAddress,
        mintAddress: nft.mint.address,
        updateAuthorityAddress: nft.updateAuthorityAddress,
        json: nft.json,
        jsonLoaded: nft.jsonLoaded,
        name: nft.name,
        symbol: nft.symbol,
        uri: nft.uri,
        isMutable: nft.isMutable,
        primarySaleHappened: nft.primarySaleHappened,
        sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
        editionNonce: nft.editionNonce,
        creators: nft.creators,
        tokenStandard: nft.tokenStandard,
        collection: nft.collection,
        collectionDetails: nft.collectionDetails,
        uses: nft.uses,
      };
    },
  },
};
