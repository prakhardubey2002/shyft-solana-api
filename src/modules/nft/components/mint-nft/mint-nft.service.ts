import { Injectable } from '@nestjs/common';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { PrintNftEditionDto } from './dto/mint-nft.dto';
import { AccountUtils } from 'src/common/utils/account-utils';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

@Injectable()
export class MintNftService {
  async printNewEdition(printNftEditionDto: PrintNftEditionDto): Promise<any> {
    const {
      network,
      private_key,
      master_nft_address,
      receiver,
      transfer_authority,
    } = printNftEditionDto;
    const feePayer = AccountUtils.getKeypair(private_key);
    const connection = new Connection(clusterApiUrl(network));
    const metaplex = Metaplex.make(connection).use(keypairIdentity(feePayer));
    const master_address = new PublicKey(master_nft_address);
    const newOwner = receiver ? new PublicKey(receiver) : feePayer.publicKey;
    const newUpdateAuthority = transfer_authority ? newOwner : feePayer.publicKey;
    const { nft: printedNft, transactionId: txId } = await metaplex.nfts().printNewEdition(master_address, {
      newUpdateAuthority,
      newOwner,
    });
    return { mint: printedNft.mint.toBase58(), txId: txId };
  }
}
