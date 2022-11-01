import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import {
  BalanceCheckDto,
  GetDomainDto,
  GetTransactionDto,
  ResolveAddressDto,
  TransactionHistoryDto,
} from './dto/balance-check.dto';
import { SendSolDto } from './dto/send-sol.dto';
import { AccountUtils } from 'src/common/utils/account-utils';
import { TokenBalanceCheckDto } from './dto/token-balance-check.dto';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { RemoteDataFetcherService } from '../data-cache/remote-data-fetcher/data-fetcher.service';
import { FetchAllNftDto } from '../data-cache/remote-data-fetcher/dto/data-fetcher.dto';
import { performReverseLookup } from '@bonfida/spl-name-service';
import { TokenUiInfo, Utility } from 'src/common/utils/utils';
import { Wallet } from 'src/common/utils/semi-wallet';
import { SemiWalletAccessor } from 'src/dal/semi-wallet-repo/semi-wallet.accessor';
import { ObjectId } from 'mongoose';
import * as base58 from 'bs58';
import { VerifyDto } from './dto/semi-wallet-dto';
import { Globals } from 'src/globals';
import { WalletDbSyncService } from '../data-cache/db-sync/wallet-db-sync.service';
import { ErrorCode } from 'src/common/utils/error-codes';
import { configuration } from 'src/common/configs/config';
import { WalletAccessor } from 'src/dal/wallet-repo/wallet.accessor';
import { DomainType } from 'src/dal/wallet-repo/wallet.schema';
import { newProgramError, newProgramErrorFrom } from 'src/core/program-error';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResyncDomainsInDbEvent, SaveDomainsInDbEvent } from '../data-cache/db-sync/db.events';

export type TokenBalanceDto = {
  address: string;
  balance: number;
  info?: TokenUiInfo;
};

const DOMAIN_SYNC_TIME_INTERVAL = parseInt(configuration().domainSyncTimeInterval);

@Injectable()
export class WalletService {
  constructor(
    private eventEmitter: EventEmitter2,
    private dataFetcher: RemoteDataFetcherService,
    private semiWalletAccessor: SemiWalletAccessor,
    private walletAccessor: WalletAccessor,
    private walletSyncService: WalletDbSyncService,
  ) {}
  async getBalance(balanceCheckDto: BalanceCheckDto): Promise<number> {
    try {
      const { wallet, network } = balanceCheckDto;
      const connection = Utility.connectRpc(network);
      const balance = await connection.getBalance(new PublicKey(wallet));
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getTransactionHistory(transactionHistoryDto: TransactionHistoryDto): Promise<any> {
    try {
      const { wallet, network, tx_num, before_tx_signature } = transactionHistoryDto;
      const connection = Utility.connectRpc(network);

      const transactionList = await connection.getSignaturesForAddress(new PublicKey(wallet), {
        before: before_tx_signature,
        limit: tx_num || 10,
      });
      const signatures = transactionList.map((tx) => tx.signature);
      const transactionDetails = await connection.getParsedTransactions(signatures);
      return transactionDetails;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getTransactionDetails(transactionDto: GetTransactionDto): Promise<any> {
    try {
      const { network, txn_signature } = transactionDto;
      const connection = Utility.connectRpc(network);
      const transactionDetails = await connection.getParsedTransaction(txn_signature);
      return transactionDetails;
    } catch (error) {
      throw newProgramError(
        'get_transaction_error',
        HttpStatus.BAD_REQUEST,
        'unable to parse txn',
        error,
        'account_service_get_transaction_details',
        { input: transactionDto },
      );
    }
  }

  async getTokenBalance(balanceCheckDto: TokenBalanceCheckDto): Promise<TokenBalanceDto> {
    try {
      const { wallet, network, token } = balanceCheckDto;
      const connection = Utility.connectRpc(network);
      let tokenAccount;
      try {
        tokenAccount = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), {
          mint: new PublicKey(token),
        });
      } catch (error) {
        //Do nothing, if mint account isnt found in the wallet, just return 0
        console.log(error);
      } finally {
        const tokenBalanceRes: TokenBalanceDto = {
          address: token,
          balance: tokenAccount?.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0,
          info: await Utility.token.getTokenUiInfoFromRegistryOrMeta(
            connection,
            token,
            Globals.getSolMainnetTokenList(),
          ),
        };

        return tokenBalanceRes;
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllTokensBalance(balanceCheckDto: BalanceCheckDto, getTokenInfo = true): Promise<TokenBalanceDto[]> {
    try {
      const { wallet, network } = balanceCheckDto;
      const connection = Utility.connectRpc(network);
      const allTokenInfo = [];
      try {
        const parsedSplAccts = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), {
          programId: TOKEN_PROGRAM_ID,
        });
        const mintAddresses = [];
        parsedSplAccts.value.forEach((token) => {
          const amount = token.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
          const decimals = token.account?.data?.parsed?.info?.tokenAmount?.decimals;
          if (decimals > 0) {
            const address = token.account?.data?.parsed?.info?.mint;
            mintAddresses.push(address);
            allTokenInfo.push({ address: address, balance: amount });
          }
        });

        if (getTokenInfo) {
          const res = await Utility.token.getMultipleTokenInfo(connection, mintAddresses);
          res?.forEach((data, i) => {
            allTokenInfo[i].info = data;
          });
        }

        return allTokenInfo;
      } catch (error) {
        //Do nothing, if mint account isnt found in the wallet, just return 0
        console.log(error);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getPortfolio(walletDto: BalanceCheckDto) {
    const portfolio = {};
    const promises = [];
    const amtPromise = this.getBalance(walletDto);
    amtPromise.then((amount) => {
      portfolio['sol_balance'] = amount;
    });

    promises.push(amtPromise);

    const tokenPromise = this.getAllTokensBalance(walletDto, false);
    tokenPromise.then((res) => {
      portfolio['num_tokens'] = Object.keys(res)?.length ?? 0;
      portfolio['tokens'] = res;
    });
    promises.push(tokenPromise);

    const nftpromise = this.dataFetcher.fetchAllNfts(new FetchAllNftDto(walletDto.network, walletDto.wallet));
    nftpromise.then((nfts) => {
      portfolio['num_nfts'] = nfts.length;
      portfolio['nfts'] = nfts;
    });

    promises.push(nftpromise);

    await Promise.allSettled(promises);
    return portfolio;
  }

  async getDomains(getDomainDto: GetDomainDto): Promise<DomainType[]> {
    try {
      const { network, wallet, refresh } = getDomainDto;
      const sinceLastWalletSyncSec = await this.walletSyncService.getTimeElapsedUntilLastSyncDomainsSec(
        network,
        wallet,
      );

      console.log('time elapsed since last domains sync: ', sinceLastWalletSyncSec);

      const isFetchFromDB = refresh === undefined && sinceLastWalletSyncSec != ErrorCode.RECORD_NOT_FOUND;

      if (isFetchFromDB) {
        const isWalletResyncNeeded = sinceLastWalletSyncSec > DOMAIN_SYNC_TIME_INTERVAL;
        console.log('resync needed (domains): ', isWalletResyncNeeded);
        console.log('reading from DB (domains)');
        const dbDomains = await this.walletAccessor.getDomainsFromWallet(network, wallet);

        if (isWalletResyncNeeded) {
          const nftWalletReadEvent = new ResyncDomainsInDbEvent(network, wallet);
          this.eventEmitter.emit('resync.wallet.domains', nftWalletReadEvent);
        }
        return dbDomains;
      }
      const resp = await this.readDomainsFromChain(getDomainDto);
      return resp;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async readDomainsFromChain(getDomainDto: GetDomainDto): Promise<DomainType[]> {
    try {
      const domains = await this.dataFetcher.fetchDomainsFromWallet(getDomainDto);

      this.eventEmitter.emit(
        'save.wallet.domains',
        new SaveDomainsInDbEvent(getDomainDto.network, getDomainDto.wallet, domains),
      );

      return domains;
    } catch (error) {
      throw newProgramErrorFrom(error);
    }
  }

  async resolveAddress(nameAddressDto: ResolveAddressDto) {
    try {
      const connection = Utility.connectRpc(nameAddressDto.network);
      const name = await performReverseLookup(connection, new PublicKey(nameAddressDto.address));
      return { name: `${name}.sol` };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createSemiWallet(password: string, apiKey: ObjectId) {
    try {
      const walletInfo = await Wallet.create(password);
      const res = await this.semiWalletAccessor.insert({
        api_key_id: apiKey,
        public_key: walletInfo.wallet.publicKey.toBase58(),
        encrytped_private_key: walletInfo.wallet.keys.encryptedPrivateKey,
        params: JSON.stringify(walletInfo.params),
      });

      return {
        wallet_address: walletInfo.wallet.publicKey,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //User id is required, because the organisation who created only they can fetch their users wallet info
  async getDecryptionKey(dto: VerifyDto, id: ObjectId) {
    try {
      //Fetch encryption params from DB
      const walletInfo = await this.semiWalletAccessor.fetch({
        public_key: dto.wallet,
        api_key_id: id,
      });

      if (!walletInfo) {
        return { msg: `No semi custodial wallet found with address: ${dto.wallet}` };
      }

      //Create wallet and verify the password
      const wallet = new Wallet(new PublicKey(dto.wallet), walletInfo.encrytped_private_key);
      await wallet.getKeypair(dto.password, JSON.parse(walletInfo.params));

      //If we are here, everything is good
      return {
        encryptedPrivateKey: walletInfo?.encrytped_private_key,
        decryptionKey: walletInfo?.params,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  //User id is required, because the organisation who created only they can fetch their users wallet info
  async getKeypair(publicKey: string, pwd: string, id: ObjectId) {
    try {
      const walletInfo = await this.semiWalletAccessor.fetch({
        public_key: publicKey,
        api_key_id: id,
      });

      if (!walletInfo) {
        return { msg: `No semi custodial wallet found with address: ${publicKey}` };
      }

      const wallet = new Wallet(new PublicKey(publicKey), walletInfo.encrytped_private_key);
      const keypair = await wallet.getKeypair(pwd, JSON.parse(walletInfo.params));
      return {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: base58.encode(keypair.secretKey),
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async sendSol(sendSolDto: SendSolDto): Promise<string> {
    try {
      const { network, from_private_key, to_address, amount } = sendSolDto;
      const connection = Utility.connectRpc(network);

      const from = AccountUtils.getKeypair(from_private_key);
      // Add transfer instruction to transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: new PublicKey(to_address),
          lamports: LAMPORTS_PER_SOL * amount,
        }),
      );

      // Sign transaction, broadcast, and confirm
      const signature = await sendAndConfirmTransaction(connection, transaction, [from]);
      return signature;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
