import { Utility } from './utils';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { toPublicKey } from '@metaplex-foundation/js';
import { Connection } from '@solana/web3.js';

describe('test getTokenSymbol', () => {
  it('should_print_the_correct_token_symbol', async () => {
    const tokenAddress = '4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv';
    const symbol = await Utility.token.getTokenSymbol(WalletAdapterNetwork.Devnet, tokenAddress);
    expect(symbol).toBe('SD');
    return;
  });

  it('get_nft_owner', async () => {
    const connection = new Connection('http://api.devnet.solana.com', {
      commitment: 'confirmed',
      disableRetryOnRateLimit: true,
    });
    const tokenAddress = '7KsBpeQB41h98VBLchNkqsgNCRY2gNRYDwwz3KLpqJTU';
    const owner = await Utility.nft.getNftOwner(connection, toPublicKey(tokenAddress));
    expect(owner).toBe('AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s');
  });

  it('get_nft_supply', async () => {
    const connection = new Connection('http://api.devnet.solana.com', {
      commitment: 'confirmed',
      disableRetryOnRateLimit: true,
    });
    const tokenAddress1 = '42W21y86sURFNaWgwDuLTfMKay5LVRzFJrMe2J7xMYTx';
    const count1 = await Utility.nft.getNftSupply(connection, toPublicKey(tokenAddress1));
    expect(count1).toBe(1);
    const tokenAddress2 = '5jg9mw8YrboXEcd8FXgNzq4oagefdMk4GWbCQbSPR3PX';
    const count2 = await Utility.nft.getNftSupply(connection, toPublicKey(tokenAddress2));
    expect(count2).toBe(0);
  });
});
