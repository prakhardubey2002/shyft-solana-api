import { Body, Controller, HttpCode, Post, Version } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SignAllTransactionsDto, SignTransactionDto } from './dto/sign-transaction.dto';
import { SignAllTransactionOpenApi, SignTransactionOpenApi } from './open-api';
import { SignTransactionService } from './sign-transaction.service';

@ApiTags('Wallet')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('wallet')
export class SignTransactionController {
  constructor(private readonly signTransactionService: SignTransactionService) {}
  @SignTransactionOpenApi()
  @Post('sign_transaction')
  @Version('1')
  @HttpCode(200)
  async signTransaction(@Body() signTransactionDto: SignTransactionDto): Promise<any> {
    const tx = await this.signTransactionService.signTransaction(signTransactionDto);
    return {
      success: true,
      message: 'Transaction signed successfully',
      result: { tx },
    };
  }

  @SignAllTransactionOpenApi()
  @Post('sign_all_transactions')
  @Version('1')
  @HttpCode(200)
  async signAllTransactions(@Body() signAllTransactionsDto: SignAllTransactionsDto): Promise<any> {
    const tx = await this.signTransactionService.signAllTransactions(signAllTransactionsDto);
    return {
      success: true,
      message: 'Transactions signed successfully',
      result: { tx },
    };
  }
}
