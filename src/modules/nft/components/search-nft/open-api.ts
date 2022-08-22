import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

const SearchAttributesResponse = {
  description: 'filtered NFTs',
  schema: {
    example: {
      success: true,
      message: 'filtered NFTs',
      result: [
        {
          name: 'sample1',
          symbol: 'NAT1',
          description: 'this is a cool Nft',
          image_uri:
            'https://ipfs.io/ipfs/bafkreifjaa6nkxy57ebusnyqshac63l7er46j3bzeoc44dxyp3hu5s4sxy',
          royalty: 0,
          mint: 'foMapernfZUpiro3qw7wRQ3221pmccU2oZ3iae9qjqG',
          attributes: {
            health: 'fit',
            energy: 100,
          },
          owner: '97a3giHcGsk8YoEgWv4rP1ooWwJBgS72fpckZM6mQiFH',
        },
        {
          name: 'sample2',
          symbol: 'NAT2',
          description: 'this is a super cool Nft',
          image_uri:
            'https://ipfs.io/ipfs/bafkreifjaa6nkxy57ebusnyqshac63l7er46j3bzeoc44dxyp3hu5s4sxy',
          royalty: 0,
          mint: '77JRLuqhrGHcN88Zvi62vHKtz5yiEe4dJ4o8kVEfqLmm',
          attributes: {
            health: 'low',
            energy: 50,
          },
          owner: '97a3giHcGsk8YoEgWv4rP1ooWwJBgS72fpckZM6mQiFH',
        },
        {
          name: 'sample3',
          symbol: 'NAT3',
          description: 'this is a mega cool Nft',
          image_uri:
            'https://ipfs.io/ipfs/bafkreifjaa6nkxy57ebusnyqshac63l7er46j3bzeoc44dxyp3hu5s4sxy',
          royalty: 0,
          mint: '5DRT5bc9upSDqWVLb6BCQEaAANYmSqkW42SSY8pysfYt',
          attributes: {
            health: 'super fit',
            energy: 200,
          },
          owner: '97a3giHcGsk8YoEgWv4rP1ooWwJBgS72fpckZM6mQiFH',
        },
      ],
    },
  },
};

export function SearchAttributesOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'filter NFTs by attribute values' }),
    ApiOkResponse(SearchAttributesResponse),
  );
}

export function SearchOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'filter NFTs by different values' }),
    ApiOkResponse({
      description: 'filtered NFTs',
      schema: {
        example: {
          success: true,
          message: 'filtered NFTs',
          result: {
            nfts: [
              {
                name: 'HEDGIE#001',
                symbol: 'HDG',
                royalty: 5,
                image_uri:
                  'https://nftstorage.link/ipfs/bafkreiff7tzd2n3dskowfvp3bcua4zc33ohumqwn7v764nuyhd3rw5qgom',
                description: 'Shyft makes it easy.',
                mint: '4VEj63tATjBSfd22Mxbe6n7ainckFU9ewRVTvfrthGDU',
                owner: '5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg',
                attributes: {
                  edification: '100',
                  energy: '50',
                },
                update_authority:
                  '5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg',
              },
            ],
            page: 1,
            size: 10,
            totalData: 1,
            totalPage: 1,
          },
        },
      },
    }),
  );
}
