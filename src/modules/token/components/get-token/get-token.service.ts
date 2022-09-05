import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getMint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { Utility } from 'src/common/utils/utils';
import { GetTokenDto } from './dto/get-token.dto';

@Injectable()
export class GetTokenService {
  async getToken(getTokenDto: GetTokenDto): Promise<any> {
    try {
      const { network, token_address } = getTokenDto;
      const connection = Utility.connectRpc(network);

      const tokenInfo = await getMint(connection, new PublicKey(token_address));
      return await Utility.token.getTokenInfo(connection, network, tokenInfo);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
