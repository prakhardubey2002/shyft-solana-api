import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export function BalanceCheckOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Check wallet balance' }),
    ApiOkResponse({
      description: 'Balance fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Balance fetched successfully',
          result: {
            balance: 0.9908624,
          },
        },
      },
    }),
  );
}

export function TokenBalanceOpenApi() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get balance of a particular token in the wallet',
    }),
    ApiOkResponse({
      description: ' Token Balance fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Token balance fetched successfully',
          result: {
            balance: 500000,
          },
        },
      },
    }),
  );
}

export function AllTokensOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Check wallet balance' }),
    ApiOkResponse({
      description: 'Balance fetched successfully',
      schema: {
        example: {
          success: true,
          message: '4 tokens fetched successfully',
          result: [
            {
              address: '7yPeRofJpfPkjLJ8CLB7czuk4sKG9toXWVq8CcHr4DcU',
              balance: 100,
            },
            {
              address: '4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv',
              balance: 500000,
            },
            {
              address: 'FK84vq6aVT2KFrKWz4m7oTufhDZdAt6qpMEBT4dziBEk',
              balance: 100,
            },
            {
              address: '3dbNYdGJ2bWXtLhMcXW6szxmKPQSAjFuxXxU3PVAwaMA',
              balance: 100,
            },
          ],
        },
      },
    }),
  );
}

export function PortfoliOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Wallet\'s portfolio' }),
    ApiOkResponse({
      description: 'Portfolio fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Portfolio fetched successfully',
          result: {
            sol_balance: 1.87873304,
            num_tokens: 2,
            tokens: [
              {
                address: '4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv',
                balance: 500000,
              },
              {
                address: '7yPeRofJpfPkjLJ8CLB7czuk4sKG9toXWVq8CcHr4DcU',
                balance: 310.000001,
              },
            ],
            num_nfts: 3,
            nfts: [
              {
                key: 4,
                updateAuthority: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
                mint: 'Cx3661bLrm7Q51yHnKSFhVr4YBLHBsvojj13nWBZkvQc',
                data: {
                  name: 'Shyft',
                  symbol: 'SH',
                  uri: 'https://nftstorage.link/ipfs/bafkreiewipf55m2tn5frny4alervvbqwdwdqmiaqzuri7ing2outmrxmke',
                  sellerFeeBasisPoints: 1000,
                  creators: [
                    {
                      address: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
                      verified: 1,
                      share: 100,
                    },
                  ],
                },
                primarySaleHappened: 0,
                isMutable: 1,
              },
              {
                key: 4,
                updateAuthority: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
                mint: '3vv1QNVH5buEjxqYFZ6N5HPweW57T4kpP6VnrkHBtuT2',
                data: {
                  name: 'some updated description',
                  symbol: 'SH',
                  uri: 'https://nftstorage.link/ipfs/bafkreicb53w3npl4o6i7hhcbphxlf3qfiysjg2g33vay66wc5mg7gbzmk4',
                  sellerFeeBasisPoints: 5000,
                  creators: [
                    {
                      address: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
                      verified: 1,
                      share: 100,
                    },
                  ],
                },
                primarySaleHappened: 0,
                isMutable: 1,
              },
              {
                key: 4,
                updateAuthority: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
                mint: '3UakQSxCAXQGSaeU41CtSvJD1J4rQShn4onKCEd9DKDs',
                data: {
                  name: 'MadBull',
                  symbol: 'MB',
                  uri: 'https://nftstorage.link/ipfs/bafkreih5mkw2qmj5uc2dq7k6ifqtxiyw6vwp6rod2pajmej3vrvevblxre',
                  sellerFeeBasisPoints: 1000,
                  creators: [
                    {
                      address: 'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx',
                      verified: 1,
                      share: 100,
                    },
                  ],
                },
                primarySaleHappened: 0,
                isMutable: 1,
              },
            ],
          },
        },
      },
    }),
  );
}

export function SendBalanceOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Transfer wallet balance' }),
    ApiOkResponse({
      description: 'SOL transferred successfully',
      schema: {
        example: {
          success: true,
          message: '1.2 SOL transferred successfully',
          result: {
            amount: 1.2,
            transactionHash:
              '2WFK7BfYfGvzHGru3nHJtepZadgAkBV6vreVn2D1yeEqLtQ5BrDp38QPVwS78WriGZ9PU1EiYCwQuLcp7XPjxV8B',
          },
        },
      },
    }),
  );
}
