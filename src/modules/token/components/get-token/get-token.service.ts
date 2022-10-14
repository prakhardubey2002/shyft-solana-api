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
      const mint = await getMint(connection, new PublicKey(token_address));
      const tokenInfo =  await Utility.token.getTokenInfo(connection, mint);
      return tokenInfo;
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
