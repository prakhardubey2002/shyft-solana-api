import { Body, Controller, Post } from '@nestjs/common';
import { BalanceCheckDto } from './dto/balance-check.dto';
import { AccountService } from './account.service';
import { SendSolDto } from './dto/send-sol.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @Post('balance')
  async balance(@Body() balanceCheckDto: BalanceCheckDto): Promise<any> {
    const balance = await this.accountService.checkBalance(balanceCheckDto);
    return {
      success: true,
      message: 'Balance fetched successfully',
      result: balance,
    };
  }

  @Post('send-sol')
  async sendSol(@Body() sendSolDto: SendSolDto): Promise<any> {
    const { amount } = sendSolDto;
    const transactionHash = await this.accountService.sendSol(sendSolDto);
    return {
      success: true,
      message: `${amount} SOL transferred successfully`,
      result: {
        amount,
        transactionHash,
      },
    };
  }
}
