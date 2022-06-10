import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { actions, Connection, NodeWallet } from '@metaplex/js';
import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import { BurnNftDto } from './dto/burn-nft.dto';
import { AccountService } from 'src/modules/account/account.service';

@Injectable()
export class BurnNftService {
  constructor(private accountService: AccountService) {}
  async burnNft(burnNftDto: BurnNftDto): Promise<any> {
    try {
      const { network, private_key, token_address, close, amount } = burnNftDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      const keypair = await this.accountService.getKeypair(private_key);
      const wallet = new NodeWallet(keypair);
      const associatedAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(token_address),
        keypair.publicKey,
      );

      const result = await actions.burnToken({
        connection,
        wallet,
        token: associatedAddress,
        mint: new PublicKey(token_address),
        amount: amount || 1,
        owner: keypair.publicKey,
        close: close,
      });
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
