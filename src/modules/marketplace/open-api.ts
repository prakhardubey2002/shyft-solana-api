import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function CreateMpOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Marketplace transaction' }),
    ApiOkResponse({
      description: 'Create marketplace transaction generated successfully',
      schema: {
        example: {
          success: true,
          message: 'Create marketplace transaction generated successfully',
          result: {
            network: 'devnet',
            address: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
            treasury_address: '9oqVFV1AGQDMTfqWsF1uYXftw9iMAzoXac4Y1RVTwSdU',
            fee_payer: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
            fee_recipient: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
            currency_address: '4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv',
            currency_symbol: 'SD',
            creator: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
            transaction_fee: 20,
            authority: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
            encoded_transaction:
              'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAcMy9k8/BAsFBh8mlrlIpNrpE06JQljT+RfaF76MYz6Ggw8R+yeVfMiObnMrg/7ZjH5/Gyx9ewfekqQYjXSofYb/oLdCYEZgu7rLH2HrJGv06UkEnTPnUzVzAuloi6A5v1X34xXeNyhD6UstHxxgD78iy4YN0+ZoX1OiWD6BXQXFdvrU09mirOi1WrXOHcW0YzUChs91eji+mKFktv8pIwCUQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM1J76pCpPcYC8+xEg11oUirp84m1fvE02rJeibqUl/2MlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WQPmfAUcjQy99BvpbIdJcEjTYW5zehwJ6MlLcgIjez4PCmWThjy6RhVk6uQTc3IVRusBUckwgna71K0qHDpCEHsGp9UXGSxcUSGMyUw9SvF/WNruCJuh/UTj29mKAAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpRsBFwbADICWNSeTI6hEr0e0jTsu5TN7n4d2aAN3B0DgBCQ0GAAAAAggBBAMLBQcKD91C8p/5zobx/v7/0AcAAA==',
          },
        },
      },
    }),
  );
}

export function CreateMpAttachedOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Create Marketplace' }),
    ApiOkResponse({
      description: 'Marketplace created successfully',
      schema: {
        example: {
          success: true,
          message: 'Marketplace created successfully',
          result: {
            network: 'devnet',
            address: '8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q',
            treasury_address: 'DWxmKf97AAMhscXryuRDYbLhUJ376tpYmnfBavR2148P',
            fee_payer: 'AQp9HjQZkdnVenFLUzSqeDY9ZoraxVMGzguHTMEifuZj',
            fee_recipient: 'AJfJZ87Eu7frVUuVQ7nqG9SWuvtceAmnoaXcVJGJwyke',
            currency_address: '4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv',
            currency_symbol: 'SD',
            creator: '97a3giHcGsk8YoEgWv4rP1ooWwJBgS72fpckZM6mQiFH',
            transaction_fee: 20,
            authority: '97a3giHcGsk8YoEgWv4rP1ooWwJBgS72fpckZM6mQiFH',
          },
        },
      },
    }),
  );
}

export function UpdateMpOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Update Marketplace transaction' }),
    ApiOkResponse({
      description: 'Update marketplace transaction generated successfully',
      schema: {
        example: {
          success: true,
          message: 'Update marketplace transaction generated successfully',
          result: {
            network: 'devnet',
            address: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
            treasury_address: 'AJfJZ87Eu7frVUuVQ7nqG9SWuvtceAmnoaXcVJGJwyke',
            fee_payer: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
            fee_recipient: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
            currency_address: '4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv',
            transaction_fee: 20,
            authority: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
            encoded_transaction:
              'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAYJy9k8/BAsFBh8mlrlIpNrpE06JQljT+RfaF76MYz6Ggw8R+yeVfMiObnMrg/7ZjH5/Gyx9ewfekqQYjXSofYb/oo/XXMqfkwj+1I1XZ6nVj2Kjsdrna8pkMcJujNxRTPjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzUnvqkKk9xgLz7ESDXWhSKunzibV+8TTasl6JupSX/YyXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZCmWThjy6RhVk6uQTc3IVRusBUckwgna71K0qHDpCEHsGp9UXGSxcUSGMyUw9SvF/WNruCJuh/UTj29mKAAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpN1QGTCUfJZSwJT3V4hqPMc4jO4RDiV2zI/BzDOjl/E4BBgwEAAAAAAIAAQgDBQcNVNcCrPEA9dsB0AcAAA==',
          },
        },
      },
    }),
  );
}

export function UpdateMpAttachedOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Update Marketplace' }),
    ApiOkResponse({
      description: 'Marketplace updated successfully',
      schema: {
        example: {
          success: true,
          message: 'Marketplace updated successfully',
          result: {
            network: 'devnet',
            address: '8DPSUU8NBFJinJRwBtdcJwi1xncaGncJszh561xx5LkM',
            currency_address: 'fMeYB3g4ppGbskqpad4X2f85qQeufUSqNVd1djWdHEy',
            currency_symbol: 'VG',
            authority: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
            fee_payer: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
            fee_recipient: '8hERWBX8aMKnQ4t5Waw18PeGrGbmK8UrvnVyuanngjY1',
            fee_holder_account: '66WcSbB6cxB2531T6ctcYkwsKvCmH4nB91qAqLHnHZ4B',
            creator: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
            transaction_fee: 10,
          },
        },
      },
    }),
  );
}

export function CreateListingOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'List NFT transaction' }),
    ApiOkResponse({
      description: 'Listing transaction created successfully',
      schema: {
        example: {
          success: true,
          message: 'Listing transaction created successfully',
          result: {
            network: 'devnet',
            marketplace_address: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
            seller_address: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
            price: 200,
            nft_address: 'GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz',
            list_state: 'G7accWXzKEvzqtA2vG5EZr1JTLpsEMvo6Kpt9sBhT8xq',
            currency_symbol: 'SD',
            encoded_transaction:
              'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAkPA+Z8BRyNDL30G+lsh0lwSNNhbnN6HAnoyUtyAiN7Pg8ZTa3UjJFWTbVDHC886jP1qM+vXRbrQyLDeoBN7DPFTuCOy9VpQ/1bFLqVafsssQa0CmDXlG0szCd/vm3xYAjy61NPZoqzotVq1zh3FtGM1AobPdXo4vpihZLb/KSMAlH+aXsh63u97m9Zk1yHYYCbZADBoeziI3rn4oalp/iO+Q2/5soX1jASgm/taWpC+DJTiveCM+DXxaFA4Q7w0ETdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8R+yeVfMiObnMrg/7ZjH5/Gyx9ewfekqQYjXSofYb/svZPPwQLBQYfJpa5SKTa6RNOiUJY0/kX2he+jGM+hoMCmWThjy6RhVk6uQTc3IVRusBUckwgna71K0qHDpCEHv0JF6XdZMSX7FZQbbAqSYK9EOLzRA1UpKkCwXfh/XVIP2RX2EYRmx3j1oYfbFSMX0y9sE2+mXakJ/DVFgXv4yXBqfVFxh70WY12tQEVf3CwMEkxo8hVnWl27rLXwgAAAAGp9UXGSxcUSGMyUw9SvF/WNruCJuh/UTj29mKAAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpY4c4ACg7P/CAYkG8uUdYoIF0PlYmgYiO9+OaxjLkXrICCQwABQsIBwMCBA4GCg0bM+aFpAF/g63+/f8A0O2QLgAAAAEAAAAAAAAACQUBAAYNDAnPayygS97DG/8=',
          },
        },
      },
    }),
  );
}

export function CreateListingAttachedOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'List NFT' }),
    ApiOkResponse({
      description: 'Listing created successfully',
      schema: {
        example: {
          success: true,
          message: 'Listing created successfully',
          result: {
            network: 'devnet',
            marketplace_address: '7b2dSy4F26A6WweKgdmXzyi5FhhN5AqhuXAQHYcaXfqW',
            seller_address: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
            price: 0.5,
            nft_address: 'GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz',
            list_state: '541UajS1pMrfzJsK9kyrvX7gnrJrfzvmWJNrZeg7hZn9',
            currency_symbol: 'SOL',
            receipt: 'G5VWuDTSREkcBhwzpKkSa6AdrqVTkAvd1L3WVpYJzAkH',
            created_at: '2022-08-22T17:09:08.000Z',
          },
        },
      },
    }),
  );
}

export function BuyListingOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Buy NFT transaction' }),
    ApiOkResponse({
      description: 'Purchase transaction created successfully',
      schema: {
        example: {
          success: true,
          message: 'Purchase transaction created successfully',
          result: {
            network: 'devnet',
            marketplace_address: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
            seller_address: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
            price: 200,
            nft_address: 'GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz',
            currecy_symbol: 'SD',
            purchase_receipt: '4BKmh7biWpFuEPvq6WsprBDKAsztHpDhc3Ljh1RxsfvU',
            buyer_address: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
            encoded_transaction:
              'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAwbjlCtsELWJl97h5yDtobRADXUyvXT9dlM1oxZPoaUeKgZTa3UjJFWTbVDHC886jP1qM+vXRbrQyLDeoBN7DPFTht1rRttlqlY+IlmDBLAR09tCGEVUO3sb8KXr43NWvxoIsfJnun6WVCXKY1i4adC9Ge6MzbpovNgA+Jmh2oGrA4vOBfBRWSobbrpxOCyEofVfy8ARqGcC6jAT7Qxt92stUa6sBLL4z5mF7dZ/deiz96fjiMgCfGZEczn2Am+z9AtUkYEaLLegLIU3EfKKLGW1JQXRrT04R3Bcle1Nsa2cPGC3QmBGYLu6yx9h6yRr9OlJBJ0z51M1cwLpaIugOb9V9+MV3jcoQ+lLLR8cYA+/IsuGDdPmaF9Tolg+gV0FxXb4I7L1WlD/VsUupVp+yyxBrQKYNeUbSzMJ3++bfFgCPID5nwFHI0MvfQb6WyHSXBI02Fuc3ocCejJS3ICI3s+D+JTC1JXK8Utcx6YjeTGQaHjrV5ZfbOd5/Ft8xffsGLa61NPZoqzotVq1zh3FtGM1AobPdXo4vpihZLb/KSMAlH+aXsh63u97m9Zk1yHYYCbZADBoeziI3rn4oalp/iO+Q2/5soX1jASgm/taWpC+DJTiveCM+DXxaFA4Q7w0ETdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzUnvqkKk9xgLz7ESDXWhSKunzibV+8TTasl6JupSX/TxH7J5V8yI5ucyuD/tmMfn8bLH17B96SpBiNdKh9hv+jJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+FnL2Tz8ECwUGHyaWuUik2ukTTolCWNP5F9oXvoxjPoaDOsANu4aL95QtH8H2beRkYzVCjAyymW4L78oISJkQkE1CmWThjy6RhVk6uQTc3IVRusBUckwgna71K0qHDpCEHv0JF6XdZMSX7FZQbbAqSYK9EOLzRA1UpKkCwXfh/XVIP2RX2EYRmx3j1oYfbFSMX0y9sE2+mXakJ/DVFgXv4yXBqfVFxh70WY12tQEVf3CwMEkxo8hVnWl27rLXwgAAAAGp9UXGSxcUSGMyUw9SvF/WNruCJuh/UTj29mKAAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpNVg58BvER2wzZnH2xJox33RVJMe4tR6d0NpPdXRNthcEFQ4ABQAQDhcDExEMCxoPGRpmBj0SAdrr6v//ANDtkC4AAAABAAAAAAAAABUFAgAPGRgJXvla5u9ARNr8FRcACg4UFxADBwYTEQwICwkNGg8SFhkABRslStmdTzEjBv/9/wDQ7ZAuAAAAAQAAAAAAAAAVBwQBAgAPGRgJ45r7B7Q4ZI//',
          },
        },
      },
    }),
  );
}

export function BuyListingAttachedOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Buy NFT' }),
    ApiOkResponse({
      description: 'Purchased successfully',
      schema: {
        example: {
          success: true,
          message: 'Purchased successfully',
          result: {
            network: 'devnet',
            marketplace_address: '8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q',
            seller_address: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
            price: 100,
            nft_address: 'B6wQuXUXkKZu5n3WEfDfdRQKNUpdwstUUErJsb1wmXB',
            currency_symbol: 'SD',
            purchase_receipt: '8g1BveFpxf2p7JNLwNQAZBWGXSPdK8Y2NHVVpfNDLpaF',
            buyer_address: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
            purchased_at: '2022-08-22T17:59:08.000Z',
          },
        },
      },
    }),
  );
}

export function UnlistOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Unlist NFT transaction' }),
    ApiOkResponse({
      description: 'NFT unlist transaction created successfully',
      schema: {
        example: {
          success: true,
          message: 'NFT unlist transaction created successfully',
          result: {
            encoded_transaction:
              'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAcMA+Z8BRyNDL30G+lsh0lwSNNhbnN6HAnoyUtyAiN7Pg8kJ7L/iPLjKPdNNyg9cbgkL6wpNz0u/kvTBA8NzCQEdlwjCjwLQmXyE4FdrjMOrvBAg3Tar4GLycTatpnp+rWt3JXBn06Qczd2uaDNsQTmYbzPU0aroBH0IwQj051lkw7rU09mirOi1WrXOHcW0YzUChs91eji+mKFktv8pIwCUQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPEfsnlXzIjm5zK4P+2Yx+fxssfXsH3pKkGI10qH2G/5H/kyNM986o7/7GrNLi5DSrdviYWnaxH+8P+orQdU9i8vZPPwQLBQYfJpa5SKTa6RNOiUJY0/kX2he+jGM+hoMCmWThjy6RhVk6uQTc3IVRusBUckwgna71K0qHDpCEHsGp9UXGHvRZjXa1ARV/cLAwSTGjyFWdaXbustfCAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpTDpvxcNFPxhKGJm9lST9x4r0o+0rOl3lIKbtGYs/z+8CCQgAAwcIBgQBCxjo298p2+zcvgBcsuwiAAAAAQAAAAAAAAAJAwIFCgirO4p+9r1bCw==',
          },
        },
      },
    }),
  );
}

export function UnlistOpenAttachedApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Unlist NFT' }),
    ApiOkResponse({
      description: 'NFT unlisted successfully',
      schema: {
        example: {
          success: true,
          message: 'NFT unlisted successfully',
          result: {
            txId: '4TPq8N3QotDhAFVzyS2itnjTTopGjohGym1TV4brjSW66uhRqFTYKKK2WHakNctgkLeRXtv4gPyuh8ZR9LWJBREs',
          },
        },
      },
    }),
  );
}

export function WithdrawOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Withdraw fees from treasury transaction' }),
    ApiOkResponse({
      description: 'Fee withdrawl transaction created successfully',
      schema: {
        example: {
          success: true,
          message: 'Fee withdrawl transaction created successfully',
          result: {
            from: 'G3e34RgH9V5EwoXRzW6Ar8FHmmmwQFEECkyVvFu24a1p',
            to: 'AJfJZ87Eu7frVUuVQ7nqG9SWuvtceAmnoaXcVJGJwyke',
            amount: 10,
            encoded_transaction:
              'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAQIy9k8/BAsFBh8mlrlIpNrpE06JQljT+RfaF76MYz6Ggw8R+yeVfMiObnMrg/7ZjH5/Gyx9ewfekqQYjXSofYb/oo/XXMqfkwj+1I1XZ6nVj2Kjsdrna8pkMcJujNxRTPj34xXeNyhD6UstHxxgD78iy4YN0+ZoX1OiWD6BXQXFdsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADNSe+qQqT3GAvPsRINdaFIq6fOJtX7xNNqyXom6lJf9CmWThjy6RhVk6uQTc3IVRusBUckwgna71K0qHDpCEHsG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqVmTtMfWM/ebklXa3iuEyXRpcoy0h/eFTETHVy9B/WVEAQYHBQACAwEHBBAApFZMOEgMqgDkC1QCAAAA',
          },
        },
      },
    }),
  );
}

export function WithdrawAttachedOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Withdraw fees from treasury' }),
    ApiOkResponse({
      description: 'Fee withdrawn successfully',
      schema: {
        example: {
          success: true,
          message: 'Fee withdrawn successfully',
          result: {
            transaction_id:
              '3Ygjr3X7EQApSdt5KnUxQgLK9x7uTCNLqPr4aUwxmUqbYaVDvDqNLpu4HTQ1uow7pVjoagEdsPc1sBLFhbjkSpA3',
            from: 'DVDKeRmPEL3HV1kE8ErtHX7xc1q93p9YqwMGrfB6wQDG',
            to: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
          },
        },
      },
    }),
  );
}

export function MyMarketsOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Get your marketplaces' }),
    ApiOkResponse({
      description: 'Marketplaces fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Marketplaces fetched successfully',
          result: [
            {
              network: 'devnet',
              address: '8VE6di1XAyb46NMz1T4r5fSZExqZkDP8jmCYQ8s5QJBU',
              authority: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
              currency_address: '4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv',
              currency_symbol: 'SD',
              fee_payer: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
              fee_recipient: '4nhpcksnKrPANftwGpNBgfkVA6cocK6pcCQm2fCxNKf1',
              creator: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
              transaction_fee: 20,
              created_at: '2022-08-18T07:00:21.773Z',
              updated_at: '2022-08-22T15:20:10.851Z',
            },
            {
              network: 'devnet',
              address: 'DBjXX7k4uZ2X4Fdp8w9T7zsKYGLN6dJuRAu7oQPJUxtC',
              authority: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
              currency_address: '22MxhzHTv3TkeUSv67KKPwud6UnSdKpahosmzJekh4rp',
              currency_symbol: 'Cf',
              fee_payer: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
              fee_recipient: '5jxWhMYUjRupnzkraxWny6Vju9iHySTVRxHRowyU5hoe',
              creator: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
              transaction_fee: 20,
              created_at: '2022-08-18T07:30:06.624Z',
              updated_at: '2022-08-22T15:18:52.580Z',
            },
            {
              network: 'devnet',
              address: '8DPSUU8NBFJinJRwBtdcJwi1xncaGncJszh561xx5LkM',
              authority: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
              currency_address: 'fMeYB3g4ppGbskqpad4X2f85qQeufUSqNVd1djWdHEy',
              currency_symbol: 'VG',
              fee_payer: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
              fee_recipient: '8hERWBX8aMKnQ4t5Waw18PeGrGbmK8UrvnVyuanngjY1',
              creator: 'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
              transaction_fee: 20,
              created_at: '2022-08-22T14:57:34.974Z',
              updated_at: '2022-08-22T15:14:53.128Z',
            },
          ],
        },
      },
    }),
  );
}

export function FindMpOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Find any on-chain marketplace' }),
    ApiOkResponse({
      description: 'Marketplace found successfully',
      schema: {
        example: {
          success: true,
          message: 'Marketplace found successfully',
          result: {
            network: 'devnet',
            address: '54K5BTMj8ynktzEeaD1iGhAJsCN2svBKmD1fTQTonbBB',
            currency_address: '4TLk2jocJuEysZubcMFCqsEFFu5jVGzTp14kAANDaEFv',
            currency_symbol: 'SD',
            authority: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
            fee_payer: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
            fee_recipient: 'AJfJZ87Eu7frVUuVQ7nqG9SWuvtceAmnoaXcVJGJwyke',
            fee_holder_account: 'G3e34RgH9V5EwoXRzW6Ar8FHmmmwQFEECkyVvFu24a1p',
            creator: 'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
            transaction_fee: 20,
          },
        },
      },
    }),
  );
}

export function ListDetailsOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Get details of a listing' }),
    ApiOkResponse({
      description: 'Listing details fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Listing details fetched successfully',
          result: {
            network: 'devnet',
            marketplace_address: '8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q',
            seller_address: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
            price: 300,
            nft_address: '5r2rJ37qUGYCqqHzvjBTjMBh4Pu2VD9wSiUnsky8UzYS',
            list_state: '8WM1Etk7fWraMshaAgYc6jBBKVAGsPwwRnNWyke9o5yN',
            currency_symbol: 'SD',
            created_at: '2022-08-22T17:40:02.000Z',
            receipt: 'D9qHwezut8c7rmLkaGE1h1Yo3fVTp9EKYnLRDFjupyA3',
            cancelled_at: '2022-08-22T17:40:37.000Z',
          },
        },
      },
    }),
  );
}

export function ActiveListingsOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all active listings in the marketplace' }),
    ApiOkResponse({
      description: 'Active listing fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Active listing fetched successfully',
          result: [
            {
              network: 'devnet',
              marketplace_address:
                '8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q',
              seller_address: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
              price: 100,
              currency_symbol: 'SD',
              nft_address: 'GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz',
              list_state: '9xPa5TQyctvZ4vGkKcgEzT316JankshomR13dPLVN2nD',
              created_at: '2022-08-22T17:16:06.000Z',
              receipt: 'FwEG6zTfM4mT9SaCMS61nswuJcfNDLEi2xn7T7gs4qRs',
            },
            {
              network: 'devnet',
              marketplace_address:
                '8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q',
              seller_address: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
              price: 300,
              currency_symbol: 'SD',
              nft_address: '5r2rJ37qUGYCqqHzvjBTjMBh4Pu2VD9wSiUnsky8UzYS',
              list_state: '8WM1Etk7fWraMshaAgYc6jBBKVAGsPwwRnNWyke9o5yN',
              created_at: '2022-08-22T17:20:17.000Z',
              receipt: 'D9qHwezut8c7rmLkaGE1h1Yo3fVTp9EKYnLRDFjupyA3',
            },
          ],
        },
      },
    }),
  );
}

export function ActiveSellersOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all active sellers in the marketplace' }),
    ApiOkResponse({
      description: 'Active sellers fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Active sellers fetched successfully',
          result: [
            '97a3giHcGsk8YoEgWv4rP1ooWwJBgS72fpckZM6mQiFH',
            'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
            'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
            'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
          ],
        },
      },
    }),
  );
}

export function SellerListingsOpenApi() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all listings done by a seller in the marketplace',
    }),
    ApiOkResponse({
      description: 'Seller listings fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Seller listings fetched successfully',
          result: [
            {
              network: 'devnet',
              marketplace_address:
                '8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q',
              seller_address: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
              price: 100,
              nft_address: 'GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz',
              currency_symbol: 'SD',
              created_at: '2022-08-22T17:16:06.000Z',
              list_state: '9xPa5TQyctvZ4vGkKcgEzT316JankshomR13dPLVN2nD',
              receipt: 'FwEG6zTfM4mT9SaCMS61nswuJcfNDLEi2xn7T7gs4qRs',
              cancelled_at: '2022-08-22T17:16:06.000Z',
            },
            {
              network: 'devnet',
              marketplace_address:
                '8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q',
              seller_address: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
              price: 300,
              nft_address: 'GpLzvmQYcQM3USH7RGehoriEzmJLJ8AfKVdLFZRoVBsz',
              currency_symbol: 'SD',
              created_at: '2022-08-22T17:43:27.000Z',
              list_state: 'C2JWsZ2G8qaJ5jXo3GnQHASG7mp3P2hPTBT9t4t7w2Ui',
              purchased_at: '2022-08-22T17:59:08.000Z',
              receipt: '4kx9aNZy1Jacwwzah3jV9mx1HLy52qz9a2b8EbjbQSWm',
            },
            {
              network: 'devnet',
              marketplace_address:
                '8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q',
              seller_address: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
              price: 100,
              nft_address: '7vuJXdVxJpztB4zdQiVYMCNgNe5JTJsdoVux6RoFLxB8',
              currency_symbol: 'SD',
              created_at: '2022-08-22T17:52:08.000Z',
              list_state: '6ZpfzfbPXTjvxDVFBjEG9nGy2ucq7rs9prr3URCpozkK',
              purchased_at: '2022-08-22T17:59:08.000Z',
              receipt: '2XAkVVJbq3RvpCGBiPABRwiNHi9Q5Ckj29h5g4Gop85m',
            },
            {
              network: 'devnet',
              marketplace_address:
                '8svcgCzGTT12h3uvDNR3BUY27hJvKtYdxcMKjEQzh14q',
              seller_address: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
              price: 100,
              nft_address: 'B6wQuXUXkKZu5n3WEfDfdRQKNUpdwstUUErJsb1wmXB',
              currency_symbol: 'SD',
              buyer_address: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
              created_at: '2022-08-22T17:58:24.000Z',
              list_state: 'GvY8fytxoEftwBDhkJ8VLBFN2iHK6aiHoDXHYejinL9d',
              purchased_at: '2022-08-22T17:59:08.000Z',
              purchase_receipt: '8g1BveFpxf2p7JNLwNQAZBWGXSPdK8Y2NHVVpfNDLpaF',
              receipt: 'HfRsreZ8Mem5RPsx8B1Tp13vuadLEKvUQ9vzRLTZfoc8',
            },
          ],
        },
      },
    }),
  );
}

export function OrderHistoryOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Get order history' }),
    ApiOkResponse({
      description: 'Order history fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Order history fetched successfully',
          result: [
            {
              network: 'devnet',
              marketplace_address:
                '7b2dSy4F26A6WweKgdmXzyi5FhhN5AqhuXAQHYcaXfqW',
              seller_address: 'GE4kh5FsCDWeJfqLsKx7zC9ijkqKpCuYQxh8FYBiTJe',
              price: 1,
              nft_address: 'DcxcgowdRg2bXFP4CcgFMaeppYY7GFquNhbZ5RwTVz3L',
              buyer_address: 'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
              created_at: '2022-08-17T04:36:16.094Z',
            },
          ],
        },
      },
    }),
  );
}

export function StatsOpenApi() {
  return applyDecorators(
    ApiOperation({ summary: 'Marketplace stats' }),
    ApiOkResponse({
      description: 'Marketplace stats fetched successfully',
      schema: {
        example: {
          success: true,
          message: 'Marketplace stats fetched successfully',
          result: {
            total_sales: 1,
            sales_volume: 0.1,
            total_sellers: 1,
            total_listings: 2,
            listed_volume: 0.2,
          },
        },
      },
    }),
  );
}
