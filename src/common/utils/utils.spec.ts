import { Utility } from './utils';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { toPublicKey } from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';

describe('test getTokenSymbol', () => {
  it('should print the correct token symbol', async () => {
    const tokenAddress = '4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv';
    const symbol = await Utility.token.getTokenSymbol(WalletAdapterNetwork.Devnet, tokenAddress);
    expect(symbol).toBe('SD');
    return;
  });

  it('get nft owner', async () => {
    const connection = new Connection('http://api.devnet.solana.com', {
      commitment: 'confirmed',
      disableRetryOnRateLimit: true,
    });
    const tokenAddress = '7KsBpeQB41h98VBLchNkqsgNCRY2gNRYDwwz3KLpqJTU';
    const owner = await Utility.nft.getNftOwner(connection, toPublicKey(tokenAddress));
    expect(owner).toBe('AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s');
  });
});
