import { Injectable } from '@nestjs/common';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, mintToChecked } from '@solana/spl-token';

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { AccountService } from 'src/modules/account/account.service';
import { MintTokenDto } from './dto/mint-token.dto';

@Injectable()
export class MintTokenService {
  constructor(private accountService: AccountService) {}
  async mintToken(mintTokenDto: MintTokenDto): Promise<any> {
    const { network, private_key, mint_token_address, amount, decimals } = mintTokenDto;
    const connection = new Connection(clusterApiUrl(network), 'confirmed');
    const feePayer = this.accountService.getKeypair(private_key);

    const tokenAddressPubkey = new PublicKey(mint_token_address);

    const tokenAccountOwner = await PublicKey.findProgramAddress(
      [
        feePayer.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenAddressPubkey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const txhash = await mintToChecked(
      connection, // connection
      feePayer, // fee payer
      tokenAddressPubkey, // mint
      tokenAccountOwner[0], // receiver (sholud be a token account)
      feePayer, // mint authority
      LAMPORTS_PER_SOL * amount,
      decimals, // decimals
    );

    return { txhash, mint_token_address };
  }
}
