import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { confirmTransactionFromBackend } from 'shyft-js';

import { SignTransactionDto } from './dto/sign-transaction.dto';

@Injectable()
export class SignTransactionService {
  async signTransaction(signTransactionDto: SignTransactionDto): Promise<any> {
    try {
      const { network, private_key, encoded_transaction } = signTransactionDto;
      const confirmTransaction = await confirmTransactionFromBackend(
        network,
        encoded_transaction,
        private_key,
      );
      return confirmTransaction;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
