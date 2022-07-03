import { Injectable } from '@nestjs/common';
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  burnChecked,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { AccountService } from 'src/modules/account/account.service';
import { BurnTokenDto } from './dto/burn-token.dto';

@Injectable()
export class BurnTokenService {
  constructor(private accountService: AccountService) {}
  async burnToken(burnTokenDto: BurnTokenDto): Promise<any> {
    try {
      const { network, private_key, token_address, amount } = burnTokenDto;

      const connection = new Connection(clusterApiUrl(network), 'confirmed');
      const feePayer = this.accountService.getKeypair(private_key);

      const tokenAddressPubkey = new PublicKey(token_address);

      const tokenAccountOwner = await PublicKey.findProgramAddress(
        [
          feePayer.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenAddressPubkey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const txhash = await burnChecked(
        connection,
        feePayer,
        tokenAccountOwner[0],
        tokenAddressPubkey,
        feePayer,
        LAMPORTS_PER_SOL * amount,
        9,
      );
      return txhash;
    } catch (err) {
      console.log(err);
    }
  }
}
