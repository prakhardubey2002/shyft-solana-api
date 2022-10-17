import { DateTime, Metaplex, toPublicKey } from '@metaplex-foundation/js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Utility } from 'src/common/utils/utils';
import { ListingReceipt, PurchaseReceipt } from '@metaplex-foundation/mpl-auction-house';
import { Listing } from 'src/dal/listing-repo/listing.schema';
import BN from 'bn.js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { Connection } from '@solana/web3.js';
import { Marketplace } from 'src/dal/marketplace-repo/marketplace.schema';

const AuctionHouseProgramId = toPublicKey('hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk');

export class MpBcDataFetcher {
  async getMarketplaceListings(network: WalletAdapterNetwork, mpAddress: string): Promise<Listing[]> {
    const connection = Utility.connectRpc(network);
    const listings = await this.getAllListings(connection, network, mpAddress);
    return this.getValidListings(connection, listings);
  }

  async getMarketplace(network: WalletAdapterNetwork, mpAddress: string): Promise<Marketplace> {
    const auctionHouse = await Utility.auctionHouse.findAuctionHouse(network, toPublicKey(mpAddress));
    const currencySymbol = await Utility.token.getTokenSymbol(network, auctionHouse.treasuryMint.address.toBase58());
    const treasuryDestinationOwner =
      currencySymbol == 'SOL' ? auctionHouse.treasuryWithdrawalDestinationAddress.toBase58() : undefined;
    const mp = new Marketplace(
      null,
      network,
      mpAddress,
      auctionHouse.treasuryMint.address.toBase58(),
      auctionHouse.feeWithdrawalDestinationAddress.toBase58(),
      treasuryDestinationOwner,
      auctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
      auctionHouse.treasuryAccountAddress.toBase58(),
      auctionHouse.sellerFeeBasisPoints / 100,
      auctionHouse.creatorAddress.toBase58(),
      currencySymbol,
      auctionHouse.authorityAddress.toBase58(),
      auctionHouse.canChangeSalePrice,
      auctionHouse.requiresSignOff,
    );
    return mp;
  }

  public async getValidListings(connection: Connection, listings: Listing[]): Promise<Listing[]> {
    const purchasedListings: Listing[] = [];
    const cancelledListings: Listing[] = [];
    const activeListings: Listing[] = [];
    listings.forEach((listing) => {
      if (listing.purchase_receipt_address) {
        purchasedListings.push(listing);
      } else if (listing.cancelled_at) {
        cancelledListings.push(listing);
      } else {
        activeListings.push(listing);
      }
    });

    const nftListingMap = new Map<string, Listing[]>();

    activeListings.forEach((listing) => {
      const nftAddress = listing.nft_address;
      if (nftListingMap.has(nftAddress)) {
        const ml = nftListingMap.get(nftAddress);
        ml.push(listing);
        nftListingMap.set(nftAddress, ml);
      } else {
        nftListingMap.set(nftAddress, new Array(listing));
      }
    });

    const validActiveListings: Listing[] = [];
    for (const [nftAddress, listings] of nftListingMap) {
      const owner = await Utility.nft.getNftOwner(connection, toPublicKey(nftAddress));
      listings.forEach((l) => {
        if (l.seller_address == owner) {
          validActiveListings.push(l);
        }
      });
    }
    const validListings = [...purchasedListings, ...cancelledListings, ...validActiveListings];
    return validListings;
  }

  public async getAllListings(
    connection: Connection,
    network: WalletAdapterNetwork,
    mpAddress: string,
  ): Promise<Listing[]> {
    const listings = await connection.getProgramAccounts(AuctionHouseProgramId, {
      filters: [
        {
          dataSize: 236,
        },
        {
          memcmp: {
            offset: 72,
            bytes: mpAddress,
          },
        },
      ],
    });

    const metaplex = Metaplex.make(connection, { cluster: network });
    const auctionsClient = metaplex.auctions();
    const auctionHouse = await auctionsClient.findAuctionHouseByAddress(toPublicKey(mpAddress)).run();
    const currencySymbol = await Utility.token.getTokenSymbol(network, auctionHouse.treasuryMint.address.toBase58());
    const dbListings = await Promise.all(
      listings.map(async (listing) => {
        try {
          const dList = ListingReceipt.deserialize(listing.account.data)[0];
          const metadata = await Metadata.fromAccountAddress(connection, dList.metadata);
          const marketplaceAddress = dList.auctionHouse.toBase58();
          const sellerAddress = dList.seller.toBase58();
          const listState = dList.tradeState.toBase58();
          const createdAt = dList.createdAt as DateTime;
          const cancelledAt = dList.canceledAt as DateTime;
          const price = (dList.price as BN).toNumber() / Math.pow(10, auctionHouse.treasuryMint.currency.decimals);
          const nftAddress = metadata.mint.toBase58();
          const dbListing = new Listing(
            null,
            network,
            marketplaceAddress,
            sellerAddress,
            price,
            nftAddress,
            listState,
            createdAt,
            listing.pubkey.toBase58(),
            currencySymbol,
            cancelledAt,
          );

          if (dList.purchaseReceipt) {
            dbListing.purchase_receipt_address = dList.purchaseReceipt.toBase58();
            const pReceipt = await PurchaseReceipt.fromAccountAddress(connection, dList.purchaseReceipt);
            dbListing.setPurchasedAt(pReceipt.createdAt as DateTime);
          }

          return dbListing;
        } catch (err) {
          console.log(err);
        }
      }),
    );

    return dbListings;
  }
}
