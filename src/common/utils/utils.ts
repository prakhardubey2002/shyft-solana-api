import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js';
import axios from 'axios';
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

  getAssociatedTokenAccountOrCreateAsscociatedAccountTx: async function (
    connection: Connection,
    payer: PublicKey,
    mint: PublicKey,
    owner: PublicKey,
    allowOwnerOffCurve = false,
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
  ): Promise<Account | Transaction> {
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
    let isAccountExist: boolean;
    try {
      account = await getAccount(connection, associatedToken);
      isAccountExist = true;
    } catch (error: unknown) {
      isAccountExist = false;
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
          return transaction;
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

    if (isAccountExist) return account;
    else return transaction;
  },
};
