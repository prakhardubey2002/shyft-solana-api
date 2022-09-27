import { Utility } from './utils';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

describe('test getTokenSymbol', () => {
  it('should print the correct token symbol', async () => {
    const tokenAddress = '4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv';
    const symbol = await Utility.token.getTokenSymbol(WalletAdapterNetwork.Devnet, tokenAddress);
    expect(symbol).toBe('SD');
    return;
  });
});
