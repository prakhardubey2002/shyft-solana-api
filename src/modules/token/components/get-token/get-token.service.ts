import { findMetadataPda } from '@metaplex-foundation/js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata-depricated';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getMint, Mint } from '@solana/spl-token';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { AnyARecord } from 'dns';
import { Utility } from 'src/common/utils/utils';
import { GetTokenDto } from './dto/get-token.dto';

interface TokenResponse
{
  name: string;
  symbol: string;
  description: string;
  image: string;
  mint_authority: string;
  freeze_authority: string;
  current_supply: number;
  address: string;
  decimals: number,
}

async function transformTokenInfo(connection: Connection, mint: Mint): Promise<TokenResponse> {
  if (mint) {
    let uriData;
    try {
      //Get metadata
      const pda = findMetadataPda(mint.address);
      const meta = await Metadata.load(connection, pda);

      if (meta) {
        uriData = await Utility.request(meta.data.data.uri);
      }
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      const decimalAmt = Math.pow(10, mint.decimals);
      return {
        name: uriData?.name,
        symbol: uriData?.symbol,
        description: uriData?.description,
        image: uriData?.image,
        address: mint.address.toBase58(),
        mint_authority: mint.mintAuthority.toBase58(),
        freeze_authority: mint.mintAuthority.toBase58(),
        current_supply: Number(mint.supply) / decimalAmt,
        decimals: mint.decimals,
      };
    }
  }
}

@Injectable()
export class GetTokenService {
  async getToken(getTokenDto: GetTokenDto): Promise<any> {
    try {
      const { network, token_address } = getTokenDto;
      const connection = new Connection(clusterApiUrl(network), 'confirmed');

      const tokenInfo = await getMint(connection, new PublicKey(token_address));
      return await transformTokenInfo(connection, tokenInfo);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}