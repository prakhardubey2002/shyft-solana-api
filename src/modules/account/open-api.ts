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
          "success": true,
          "message": "Token balance fetched successfully",
          "result": {
              "address": "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
              "balance": 76.6726,
              "info": {
                  "name": "Wrapped Bitcoin (Sollet)",
                  "symbol": "BTC",
                  "image": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png"
              }
            }
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
          "success": true,
          "message": "2 tokens fetched successfully",
          "result": [
              {
                  "address": "2FGW8BVMu1EHsz2ZS9rZummDaq6o2DVrZZPw4KaAvDWh",
                  "balance": 21607120,
                  "info": {
                      "name": "BSVBEAR",
                      "symbol": "BSVBEAR",
                      "image": ""
                  }
              },
              {
                  "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                  "balance": 2.968471,
                  "info": {
                      "name": "USD Coin",
                      "symbol": "USDC",
                      "image": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
                  }
              }
          ]
      },
      },
    }),
  );
}

export function PortfoliOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: "Get Wallet's portfolio" }),
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

export function TransactionHistoryOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Get transaction history' }),
    ApiOkResponse({
      description: 'Last 2 transaction fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Last 2 transaction fetched successfully',
          result: [
            {
              blockTime: 1660121082,
              meta: {
                err: null,
                fee: 5000,
                innerInstructions: [],
                loadedAddresses: {
                  readonly: [],
                  writable: [],
                },
                logMessages: [
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]',
                  'Program log: Instruction: TransferChecked',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 6199 of 200000 compute units',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
                ],
                postBalances: [
                  36188539840, 2039280, 2039280, 1461600, 934087680,
                ],
                postTokenBalances: [
                  {
                    accountIndex: 1,
                    mint: '1C3n35poNbm2di6W8YTKjG2BmhaFxmTtbScy1ox2xvY',
                    owner: 'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R',
                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    uiTokenAmount: {
                      amount: '20000000000',
                      decimals: 9,
                      uiAmount: 20,
                      uiAmountString: '20',
                    },
                  },
                  {
                    accountIndex: 2,
                    mint: '1C3n35poNbm2di6W8YTKjG2BmhaFxmTtbScy1ox2xvY',
                    owner: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    uiTokenAmount: {
                      amount: '30000000000',
                      decimals: 9,
                      uiAmount: 30,
                      uiAmountString: '30',
                    },
                  },
                ],
                preBalances: [
                  36188544840, 2039280, 2039280, 1461600, 934087680,
                ],
                preTokenBalances: [
                  {
                    accountIndex: 1,
                    mint: '1C3n35poNbm2di6W8YTKjG2BmhaFxmTtbScy1ox2xvY',
                    owner: 'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R',
                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    uiTokenAmount: {
                      amount: '10000000000',
                      decimals: 9,
                      uiAmount: 10,
                      uiAmountString: '10',
                    },
                  },
                  {
                    accountIndex: 2,
                    mint: '1C3n35poNbm2di6W8YTKjG2BmhaFxmTtbScy1ox2xvY',
                    owner: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    uiTokenAmount: {
                      amount: '40000000000',
                      decimals: 9,
                      uiAmount: 40,
                      uiAmountString: '40',
                    },
                  },
                ],
                rewards: [],
                status: {
                  Ok: null,
                },
              },
              slot: 154019432,
              transaction: {
                message: {
                  accountKeys: [
                    {
                      pubkey: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
                      signer: true,
                      writable: true,
                    },
                    {
                      pubkey: '4NAZoScfSCtHoarRzLQLtanL2mPfvB5oh98LhUmdQZ4s',
                      signer: false,
                      writable: true,
                    },
                    {
                      pubkey: '5BiU18pnTjhvgWNXeUCLuEt8p8HhEtpTWjFLaWzTyBge',
                      signer: false,
                      writable: true,
                    },
                    {
                      pubkey: '1C3n35poNbm2di6W8YTKjG2BmhaFxmTtbScy1ox2xvY',
                      signer: false,
                      writable: false,
                    },
                    {
                      pubkey: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                      signer: false,
                      writable: false,
                    },
                  ],
                  addressTableLookups: null,
                  instructions: [
                    {
                      parsed: {
                        info: {
                          authority:
                            '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
                          destination:
                            '4NAZoScfSCtHoarRzLQLtanL2mPfvB5oh98LhUmdQZ4s',
                          mint: '1C3n35poNbm2di6W8YTKjG2BmhaFxmTtbScy1ox2xvY',
                          source:
                            '5BiU18pnTjhvgWNXeUCLuEt8p8HhEtpTWjFLaWzTyBge',
                          tokenAmount: {
                            amount: '10000000000',
                            decimals: 9,
                            uiAmount: 10,
                            uiAmountString: '10',
                          },
                        },
                        type: 'transferChecked',
                      },
                      program: 'spl-token',
                      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    },
                  ],
                  recentBlockhash:
                    'GDgPVeLnjG52xktcYKASX4gQPqyxGr58UKKNBxaSjjB9',
                },
                signatures: [
                  'g9utkFojt6wtXsmLUhw5a17AJpjZo157Hzzq1Aqe771QwpPBzw1v4LSEus3MJibSJx8VzR2CfaiWbR2ueHFTr9e',
                ],
              },
            },
            {
              blockTime: 1660115652,
              meta: {
                err: null,
                fee: 5000,
                innerInstructions: [
                  {
                    index: 0,
                    instructions: [
                      {
                        parsed: {
                          info: {
                            mint: '48rLtqWcGros2eJ1anmYydTecxvkyErfaeD3dmNx1dUM',
                          },
                          type: 'getAccountDataSize',
                        },
                        program: 'spl-token',
                        programId:
                          'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                      },
                      {
                        parsed: {
                          info: {
                            lamports: 2039280,
                            newAccount:
                              'yyt6L1Q6nsQSiCdTuVG9mEqTTVYR8BhzsFd7DY1TSDx',
                            owner:
                              'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                            source:
                              '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
                            space: 165,
                          },
                          type: 'createAccount',
                        },
                        program: 'system',
                        programId: '11111111111111111111111111111111',
                      },
                      {
                        parsed: {
                          info: {
                            account:
                              'yyt6L1Q6nsQSiCdTuVG9mEqTTVYR8BhzsFd7DY1TSDx',
                          },
                          type: 'initializeImmutableOwner',
                        },
                        program: 'spl-token',
                        programId:
                          'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                      },
                      {
                        parsed: {
                          info: {
                            account:
                              'yyt6L1Q6nsQSiCdTuVG9mEqTTVYR8BhzsFd7DY1TSDx',
                            mint: '48rLtqWcGros2eJ1anmYydTecxvkyErfaeD3dmNx1dUM',
                            owner:
                              '5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg',
                          },
                          type: 'initializeAccount3',
                        },
                        program: 'spl-token',
                        programId:
                          'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                      },
                    ],
                  },
                ],
                loadedAddresses: {
                  readonly: [],
                  writable: [],
                },
                logMessages: [
                  'Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL invoke [1]',
                  'Program log: Create',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
                  'Program log: Instruction: GetAccountDataSize',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 1622 of 394408 compute units',
                  'Program return: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA pQAAAAAAAAA=',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
                  'Program 11111111111111111111111111111111 invoke [2]',
                  'Program 11111111111111111111111111111111 success',
                  'Program log: Initialize the associated token account',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
                  'Program log: Instruction: InitializeImmutableOwner',
                  'Program log: Please upgrade to SPL Token 2022 for immutable owner support',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 1405 of 387918 compute units',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
                  'Program log: Instruction: InitializeAccount3',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4241 of 384034 compute units',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
                  'Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL consumed 20545 of 400000 compute units',
                  'Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL success',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]',
                  'Program log: Instruction: TransferChecked',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 6199 of 379455 compute units',
                  'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
                ],
                postBalances: [
                  36188544840, 2039280, 2039280, 1, 1461600, 0, 731913600,
                  1009200, 934087680,
                ],
                postTokenBalances: [
                  {
                    accountIndex: 1,
                    mint: '48rLtqWcGros2eJ1anmYydTecxvkyErfaeD3dmNx1dUM',
                    owner: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    uiTokenAmount: {
                      amount: '0',
                      decimals: 0,
                      uiAmount: null,
                      uiAmountString: '0',
                    },
                  },
                  {
                    accountIndex: 2,
                    mint: '48rLtqWcGros2eJ1anmYydTecxvkyErfaeD3dmNx1dUM',
                    owner: '5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg',
                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    uiTokenAmount: {
                      amount: '1',
                      decimals: 0,
                      uiAmount: 1,
                      uiAmountString: '1',
                    },
                  },
                ],
                preBalances: [
                  36190589120, 2039280, 0, 1, 1461600, 0, 731913600, 1009200,
                  934087680,
                ],
                preTokenBalances: [
                  {
                    accountIndex: 1,
                    mint: '48rLtqWcGros2eJ1anmYydTecxvkyErfaeD3dmNx1dUM',
                    owner: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
                    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    uiTokenAmount: {
                      amount: '1',
                      decimals: 0,
                      uiAmount: 1,
                      uiAmountString: '1',
                    },
                  },
                ],
                rewards: [],
                status: {
                  Ok: null,
                },
              },
              slot: 154005129,
              transaction: {
                message: {
                  accountKeys: [
                    {
                      pubkey: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
                      signer: true,
                      writable: true,
                    },
                    {
                      pubkey: 'BLXDJvswcsaC4GiV4jSBbbKyTbARgu9vEjYzKAENvpe9',
                      signer: false,
                      writable: true,
                    },
                    {
                      pubkey: 'yyt6L1Q6nsQSiCdTuVG9mEqTTVYR8BhzsFd7DY1TSDx',
                      signer: false,
                      writable: true,
                    },
                    {
                      pubkey: '11111111111111111111111111111111',
                      signer: false,
                      writable: false,
                    },
                    {
                      pubkey: '48rLtqWcGros2eJ1anmYydTecxvkyErfaeD3dmNx1dUM',
                      signer: false,
                      writable: false,
                    },
                    {
                      pubkey: '5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg',
                      signer: false,
                      writable: false,
                    },
                    {
                      pubkey: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                      signer: false,
                      writable: false,
                    },
                    {
                      pubkey: 'SysvarRent111111111111111111111111111111111',
                      signer: false,
                      writable: false,
                    },
                    {
                      pubkey: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                      signer: false,
                      writable: false,
                    },
                  ],
                  addressTableLookups: null,
                  instructions: [
                    {
                      parsed: {
                        info: {
                          account:
                            'yyt6L1Q6nsQSiCdTuVG9mEqTTVYR8BhzsFd7DY1TSDx',
                          mint: '48rLtqWcGros2eJ1anmYydTecxvkyErfaeD3dmNx1dUM',
                          rentSysvar:
                            'SysvarRent111111111111111111111111111111111',
                          source:
                            '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
                          systemProgram: '11111111111111111111111111111111',
                          tokenProgram:
                            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                          wallet:
                            '5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg',
                        },
                        type: 'create',
                      },
                      program: 'spl-associated-token-account',
                      programId: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
                    },
                    {
                      parsed: {
                        info: {
                          authority:
                            '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
                          destination:
                            'yyt6L1Q6nsQSiCdTuVG9mEqTTVYR8BhzsFd7DY1TSDx',
                          mint: '48rLtqWcGros2eJ1anmYydTecxvkyErfaeD3dmNx1dUM',
                          source:
                            'BLXDJvswcsaC4GiV4jSBbbKyTbARgu9vEjYzKAENvpe9',
                          tokenAmount: {
                            amount: '1',
                            decimals: 0,
                            uiAmount: 1,
                            uiAmountString: '1',
                          },
                        },
                        type: 'transferChecked',
                      },
                      program: 'spl-token',
                      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                    },
                  ],
                  recentBlockhash:
                    '2D2KxekCVay8uG4gYoBKywWAwbbbBdXXHAsqDMBMqt3r',
                },
                signatures: [
                  '2akhRxHAjQ9HP1KntyaLgMMPdBoja1HfCjeS72MdD1LR6AqY6JM2PsgEUA9MyfxxdCag8PEgd5R6YvZ2G29eQLtm',
                ],
              },
            },
          ],
        },
      },
    }),
  );
}

export function CreateSemiWalletOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Create semi custodial wallet' }),
    ApiOkResponse({
      description: 'Semi custodial wallet created successfully',
      schema: {
        example: {
          success: true,
          message: 'Semi custodial wallet created successfully',
          result: {
            wallet_address: 'VtkQHQt6GFggoNiWT7Tvafce6cJvCZbzEU8gBTez5rz',
          },
        },
      },
    }),
  );
}

export function DecryptSemiWalletOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Decrypt semi custodial wallet' }),
    ApiOkResponse({
      description: 'Decryption Data',
      schema: {
        example: {
          success: true,
          message: 'Decryption Data',
          result: {
              encryptedPrivateKey: 'A9tP2aDsBNwSUojMc2eFF8qakkRRrfrYeUkGvFmZBHtrLPU7s9BNYupRazdMcbGuXtHpAbfW32MZgmGxdM5Z5U8wZrEZ5cNUcnjCSptRE2Hv3jB1zUP8JHKg8U44LM238ZUtHGUvZJcS1',
              decryptionKey: '{\"salt\":\"8YBdmxT3aoSCAAMBKwYw6V\",\"kdf\":\"pbkdf2\",\"digest\":\"sha256\",\"iterations\":100000,\"nonce\":\"GevsymPUrngEKXxBPWQvTyufrY9XKnsM9\"}'
          },
        },
      },
    }),
  );
}