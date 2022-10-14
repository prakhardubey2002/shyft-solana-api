import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { BalanceCheckDto, ResolveAddressDto, TransactionHistoryDto } from './dto/balance-check.dto';
import { WalletService } from './account.service';
import { SendSolDto } from './dto/send-sol.dto';
import {
  AllTokensOpenApi,
  BalanceCheckOpenApi,
  CreateSemiWalletOpenApi,
  DecryptSemiWalletOpenApi,
  PortfoliOpenApi,
  SendBalanceOpenApi,
  TokenBalanceOpenApi,
  TransactionHistoryOpenApi,
} from './open-api';
import { TokenBalanceCheckDto } from './dto/token-balance-check.dto';
import { GetKeypairDto, Password, VerifyDto } from './dto/semi-wallet-dto';    

@ApiTags('Wallet')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('wallet')
export class AccountController {
  constructor(private readonly walletService: WalletService) {}
  @BalanceCheckOpenApi()
  @Get('balance')
  @Version('1')
  async balance(@Query() balanceCheckDto: BalanceCheckDto): Promise<any> {
    const balance = await this.walletService.getBalance(balanceCheckDto);
    return {
      success: true,
      message: 'Balance fetched successfully',
      result: { balance: balance },
    };
  }

  @SendBalanceOpenApi()
  @Post('send_sol')
  @Version('1')
  @HttpCode(200)
  async sendSol(@Body() sendSolDto: SendSolDto): Promise<any> {
    const { amount } = sendSolDto;
    const transactionHash = await this.walletService.sendSol(sendSolDto);
    return {
      success: true,
      message: `${amount} SOL transferred successfully`,
      result: {
        amount,
        transactionHash,
      },
    };
  }

  @TokenBalanceOpenApi()
  @Get('token_balance')
  @Version('1')
  async tokenBalance(@Query() tokenBalanceCheckDto: TokenBalanceCheckDto): Promise<any> {
    const tokenBalance = await this.walletService.getTokenBalance(tokenBalanceCheckDto);
    return {
      success: true,
      message: 'Token balance fetched successfully',
      result: tokenBalance,
    };
  }

  @PortfoliOpenApi()
  @Get('get_portfolio')
  @Version('1')
  async portfolio(@Query() balanceCheckDto: BalanceCheckDto): Promise<any> {
    const res = await this.walletService.getPortfolio(balanceCheckDto);
    return {
      success: true,
      message: 'Portfolio fetched successfully',
      result: res,
    };
  }

  @AllTokensOpenApi()
  @Get('all_tokens')
  @Version('1')
  async allTokens(@Query() balanceCheckDto: BalanceCheckDto): Promise<any> {
    const allTokens = await this.walletService.getAllTokensBalance(balanceCheckDto);
    const count = Object.keys(allTokens)?.length ?? 0;
    return {
      success: true,
      message: `${count} tokens fetched successfully`,
      result: allTokens,
    };
  }

  @AllTokensOpenApi()
  @Get('get_domains')
  @Version('1')
  async getDomains(@Query() balanceCheckDto: BalanceCheckDto): Promise<any> {
    const allTokens = await this.walletService.getDomains(balanceCheckDto);
    const count = Object.keys(allTokens)?.length ?? 0;
    return {
      success: true,
      message: `${count} domains fetched successfully`,
      result: allTokens,
    };
  }

  @AllTokensOpenApi()
  @Get('resolve_address')
  @Version('1')
  async resolveAddress(@Query() addressDto: ResolveAddressDto): Promise<any> {
    const allTokens = await this.walletService.resolveAddress(addressDto);
    return {
      success: true,
      message: 'Address resolved successfully',
      result: allTokens,
    };
  }

  @TransactionHistoryOpenApi()
  @Get('transaction_history')
  @Version('1')
  async transactionHistory(@Query() transactionHistoryDto: TransactionHistoryDto): Promise<any> {
    const transactions = await this.walletService.getTransactionHistory(transactionHistoryDto);
    const tx_num = transactions ? transactions?.length : 0;
    return {
      success: true,
      message: `Last ${tx_num} transaction fetched successfully`,
      result: transactions,
    };
  }

  @CreateSemiWalletOpenApi()
  @Post('create_semi_wallet')
  @Version('1')
  async createSemiWallet(
    @Body() password: Password,
    @Req() request: any,
  ): Promise<any> {
    const semiWallet = await this.walletService.createSemiWallet(password?.password, request.id);
    return {
      success: true,
      message: `Semi custodial wallet created successfully`,
      result: semiWallet,
    };
  }

  @DecryptSemiWalletOpenApi()
  @Get('decrypt_semi_wallet')
  @Version('1')
  async decryptSemiWallet(@Body() verifyDto: VerifyDto, @Req() request: any): Promise<any> {
    const res = await this.walletService.getDecryptionKey(verifyDto, request.id);
    return {
      success: true,
      message: `Decryption Data`,
      result: res,
    };
  }

  @Get('get_keypair')
  @Version('1')
  async getKeypair(@Body() getKeypairDto: GetKeypairDto, @Req() request: any): Promise<any> {
    const res = await this.walletService.getKeypair(getKeypairDto.wallet, getKeypairDto.password, request.id);
    return {
      success: true,
      message: `Decryption Data`,
      result: res,
    };
  }
}
