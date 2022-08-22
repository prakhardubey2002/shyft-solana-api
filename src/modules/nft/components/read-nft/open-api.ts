import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

const ReadAllResponse = {
  description: 'Your all NFTs',
  schema: {
    example: {
      success: true,
      message: 'Your all NFTs',
      result: {
        count: 3,
        nfts: [
          {
            name: 'Shyft',
            symbol: 'SH',
            royalty: 0,
            image_uri:
              'https://ipfs.io/ipfs/bafkreibivcky2t2bycsycp5d57ubtqaznqtqdnnw7grbvrrc4zdfrnspfu',
            description: 'Shyft, not accenture',
            attributes: {},
            mint: '3PCt2frS9X5RwuH2KnebpUpHXcAqszvrWHnZg2m1wqDr',
            owner: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
          },
          {
            name: 'SHYFT',
            symbol: 'SHF',
            royalty: 5,
            image_uri:
              'https://ipfs.io/ipfs/bafkreig7amamflgtsovczf2el7jt7kuwf274jeaeofjy7iaa34r7exydzm',
            description: 'some description',
            attributes: {
              health: 100,
            },
            mint: '9XTGWZENKa18N1vgCQ3RjJWHG92Di2JKYi73jiC4hkEM',
            owner: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
          },
          {
            name: 'Nightweaver',
            symbol: 'NW',
            royalty: 0,
            image_uri:
              'ipfs://bafkreibivcky2t2bycsycp5d57ubtqaznqtqdnnw7grbvrrc4zdfrnspfu',
            description:
              'Night is considered to be a synonym for black in many cultures, a color which can absorb every other color. The Noki tribe, creators of this sword is believed by many to dwell in the darkness. Forged using the dark energy of the night, this sword can even slice through darkness itself.',
            attributes: {
              Performance: '28',
              Fortune: '20',
              Regeneration: '26',
              Quality: 'Rare',
            },
            mint: 'ApJPjFr585xKSMk7EtAKU4UrcpyEgdN7X8trvd3gChYk',
            owner: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
          },
        ],
      },
    },
  },
};

export function ReadAllOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Read all NFT from a wallet' }),
    ApiOkResponse(ReadAllResponse),
  );
}

export function ReadAllByCreatorOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Read all NFT from creator address' }),
    ApiOkResponse({
      description: "Creator's all NFTs",
      schema: {
        example: {
          success: true,
          message: "Creator's all NFTs",
          result: {
            nfts: [
              {
                name: 'Cool Monkry',
                symbol: 'CMY',
                royalty: 5,
                image_uri:
                  'https://nftstorage.link/ipfs/bafkreie2ef3z2cixfnxby5zfprv2xa7lydy5biky34v2p2fgsb5b4mcfaa',
                description: 'Shyft makes web3 development so easy.',
                update_authority:
                  'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R',
                attributes: {
                  edification: '100',
                },
                mint: '8bw5T3QxCEU7ZkSH2moydoioefJn8LYoCGUpccjLxkyR',
                owner: 'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R',
              },
            ],
            page: 1,
            size: 2,
            total_data: 9,
            total_page: 5,
          },
        },
      },
    }),
  );
}

export function ReadOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Read NFT  using mint address' }),
    ApiOkResponse({
      description: 'Read NFT using mint address',
      schema: {
        example: {
          success: true,
          message: 'NFT Data',
          result: {
            name: 'SHYFT',
            description: 'some description',
            symbol: 'SHF',
            image_uri:
              'https://ipfs.io/ipfs/bafkreig7amamflgtsovczf2el7jt7kuwf274jeaeofjy7iaa34r7exydzm',
            attributes: {
              health: 100,
            },
            royalty: 5,
            mint: '9XTGWZENKa18N1vgCQ3RjJWHG92Di2JKYi73jiC4hkEM',
            owner: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
          },
        },
      },
    }),
  );
}
