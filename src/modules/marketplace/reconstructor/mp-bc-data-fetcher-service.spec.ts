import { now } from '@metaplex-foundation/js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection } from '@solana/web3.js';
import { Listing } from 'src/dal/listing-repo/listing.schema';
import { MpBcDataFetcher } from './mp-bc-data-fetcher-service';

jest.setTimeout(30 * 1000);

function from(no: any): Listing {
  const l = new Listing(
    no.api_key_id,
    no.network,
    no.marketplace_address,
    no.seller_address,
    no.price,
    no.nft_address,
    no.list_state,
    now(),
    no.receipt_address,
    no.currency_symbol,
    no.cancelled_at,
  );
  l.purchase_receipt_address = no.purchase_receipt_address;
  l.purchased_at = no.purchased_at;
  return l;
}

describe('check what happens', () => {
  beforeEach(() => {
    jest.setTimeout(30 * 1000);
  });

  it('get_all_marketplace_listings', async () => {
    const connection = new Connection('http://api.devnet.solana.com', {
      commitment: 'confirmed',
      disableRetryOnRateLimit: true,
    });
    const mp = new MpBcDataFetcher();
    const listings = await mp.getAllListings(
      connection,
      WalletAdapterNetwork.Devnet,
      'dKtXyGgDGCyXiWtj9mbXUXk7ww996Uyc46CVt3ukJwV',
    );
    console.log(listings);
    expect(listings.length).toBeGreaterThan(0);
    expect(listings[0].nft_address).not.toBeNull();
  });

  it('get_all_valid_marketplace_listings', async () => {
    const connection = new Connection('http://api.devnet.solana.com', {
      commitment: 'confirmed',
      disableRetryOnRateLimit: true,
    });
    const mp = new MpBcDataFetcher();
    const listings: Listing[] = [
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '9tbyhoEx7k9B81dbTcwYgz9SLfWmDPbdBsavqQfGktyB',
        price: 1,
        nft_address: '5JgohypT1abkJvvzLzdayRjcEprrHmR1yG91S6wAVwM1',
        list_state: '67xKKGz1i4xR5s6FNQiiM49M5zYmTsVZhrtdj1gYnbge',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: 'Fa26MqXghrP5FYojobz6S3oXSnfAqPakJUTehGDEpntE',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '62ziodquMcf6PHgcndcjV9rN9YxGpsyRVPz6oqV1KEbV',
        price: 2,
        nft_address: '67HnQZhkM72x314yqMCShQ8Ag2SWAqXbKwKVDrUsi49r',
        list_state: 'CdU2tFv4AaUhSPhwkCgZMhog5LkRsqT4amK4YfCDYSF1',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: '2bB4EsAEJdeJu3J5bMGKmse238Js1XfbUm2YkyRuqnk8',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '62ziodquMcf6PHgcndcjV9rN9YxGpsyRVPz6oqV1KEbV',
        price: 2,
        nft_address: '2cCT5H3TpoEURPj3FsJSwwKX39KQ9EVFaQDiL3J1JBhN',
        list_state: 'HLvQ28bmyPtdikBkm8YbaUbL6M4prLsCb2AxqGUbhP2J',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: '5tnNW2AuWZgNUhms1FMyxR2YfWtYLCvooa6eazAMNhSY',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '97a3giHcGsk8YoEgWv4rP1ooWwJBgS72fpckZM6mQiFH',
        price: 20,
        nft_address: '235hGzvRStJa143ae9wGQToHsw67GXwKK28uGUsUL4nM',
        list_state: '9cvX49k63iRrLyxsdCHWxC5AxcJVFYSQSU7UhfV3N78z',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: '6KePZZZqnjeQizn7HvtxDATirvJv4UXFjisQv9ExVnd8',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '62ziodquMcf6PHgcndcjV9rN9YxGpsyRVPz6oqV1KEbV',
        price: 1,
        nft_address: 'GCvCTw6J8eMuSBEcRmBQsMkC5X6hEeDRMmKDvhzdbmht',
        list_state: 'crJ8jEFWPJCAPbxqbWS8EsaH9GWax9pXHpKsSXD3umn',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: 'EQVjTco7W5NSQr1XY9iDUJHeFT3Rg7mgiknoQ61XpSmF',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '62ziodquMcf6PHgcndcjV9rN9YxGpsyRVPz6oqV1KEbV',
        price: 3,
        nft_address: '2KrUHsri2TUVPgrqW7qJH2o4GPKDfXmJYbbZStwUPzhU',
        list_state: 'Crax6JTbmhK5qqtq9ww12DE3gieyEmNSXTdwD5fh2sX8',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: 'EeyK5PSwaLoeXGiw1ZTLrTspAbN8KGeKqHsrwHRVRZHd',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '62ziodquMcf6PHgcndcjV9rN9YxGpsyRVPz6oqV1KEbV',
        price: 1,
        nft_address: '7DYgkyWV2tTyJGZnMKf5EpuSB7h41iGVxHmSThTjyf9i',
        list_state: '4gmgA3NkQRmENfmXNxQZhpN2rCACTQwguKLdqh8vvtGA',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: '3pzyZfASCBmaFp3o3qTrXprXM8s4zr16rmAmKrAxymZP',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '62ziodquMcf6PHgcndcjV9rN9YxGpsyRVPz6oqV1KEbV',
        price: 2,
        nft_address: '8vEiqm2cpq4KX3UDNidMPFoDeFicDWYBNAVd1EXn6vdz',
        list_state: 'EjAQgUHBbweAYXiVBTTc8a1V8s8i7ZNyb5PvZPiSo3Qu',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: '9F4jZzHXNFR9ceQdi9MLQcvgB3DX6KLKhErK8Zaz2Ef2',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '62ziodquMcf6PHgcndcjV9rN9YxGpsyRVPz6oqV1KEbV',
        price: 2,
        nft_address: '9pBGSF8f1eXw48Mxr8ibwANSZj7TRujGTkvDd7XM3giH',
        list_state: '321mRZsnrYUUc4hxQWZHY8vWHpvYrAAjd41vFobwG2Wv',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: 'AufUFWrM9FbfYVa8P6XWG2mwhjRH9Mg2y3PEFsg9Xf9m',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: 'A8F5kP3JUjZ5dshgAMRpR76Z6z1Hp8dng3TCMVxG8Dfw',
        price: 3,
        nft_address: '8ERF3KygKy3gSs3NbLeNKJmZjQiwDimvHTkcteiB3nk9',
        list_state: 'hgqumfbqytnXVUwok2fU31CXBp9kGz21TY5hgBhmCWX',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: '3JdjjPNgktpaaCkePNHqpvStwXSrSFXAMMHzogXKQizi',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '62ziodquMcf6PHgcndcjV9rN9YxGpsyRVPz6oqV1KEbV',
        price: 2,
        nft_address: 'BBKJc9sU1qzt4tmZGkgAvJVfK19UF2y1rKeidScLsqvZ',
        list_state: 'CoWUh6auxfK4AsUDpbgMTGmjcquSVrB8U7xhEkz2f4n3',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: '6sKEQxsJnjAUzgdDCNc5DRZMEcxypG6kRgTAevRGT1Tj',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: 'A8F5kP3JUjZ5dshgAMRpR76Z6z1Hp8dng3TCMVxG8Dfw',
        price: 1,
        nft_address: '5rQCHfJZ4JpUNLDmqNu8m5feeeo4cZ4QNz6ztfSta577',
        list_state: '8cjMMqBKVfcCPmBVBnFABZ9LHRBFazy74A8QeT3rHMUc',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: 'C519N3gR8Wog6QZZbjvoGTw8Jwb9Jn6jXzJAn4skVS8o',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: 'A8F5kP3JUjZ5dshgAMRpR76Z6z1Hp8dng3TCMVxG8Dfw',
        price: 2,
        nft_address: 'FjCjBMkPQR9L6HxPpVHYB5TaCp1N4nS23cUaE92a1DJG',
        list_state: '5pYb8zV7jvkqf9aE81u1KgCrtuSUDbA1uxeZKo5qqJL3',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: 'FpbwGoF8unaLNgsX9wXifv3ep1am6HsqFzHbFYNLYpsz',
      }),
      from({
        api_key_id: null,
        network: 'devnet',
        marketplace_address: '5J8iyoAAXpn2Hxh5ketJaNFVBCSZqHrMjH6Z49ZVCNij',
        seller_address: '6yPjW1bDnVvQzQcteBLyDWFEgdT7MVuxMnDPSVyx5KhS',
        price: 3,
        nft_address: 'FjCjBMkPQR9L6HxPpVHYB5TaCp1N4nS23cUaE92a1DJG',
        //nft_address: '4Lr3SBhzxUrqqnQuaL7vk2SNRGrL3NDFkQWnDstK2j7f',
        list_state: 'AAnu8Zt9DRaKBut5S2A9EhsGk8rXx5BNAWRkJLk9mkKm',
        currency_symbol: 'LUNC',
        cancelled_at: null,
        receipt_address: '71BJKgWMu1F4Vx9sQfSSFSvvN6p9fS1JysT2RnM27N98',
      }),
    ];

    const validListings = await mp.getValidListings(connection, listings);
    console.log(`og listings: ${listings.length}, valid listings: ${validListings.length}`);
    expect(validListings.length).toEqual(listings.length - 1);
  });

  it('get_mp', async () => {
    const mps = new MpBcDataFetcher();
    const mp = await mps.getMarketplace(WalletAdapterNetwork.Devnet, 'A9iapt1o4QzGxcxob2epZoAJ1m3DcmkNmW3cdBsjoWBb');
    console.log(mp);
    expect(mp.currency_address).toEqual('So11111111111111111111111111111111111111112');
  });
});
