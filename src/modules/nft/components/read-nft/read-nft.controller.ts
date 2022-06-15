import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ReadAllNftDto } from './dto/read-all-nft.dto';
import { ReadNftDto } from './dto/read-nft.dto';
import { ReadNftService } from './read-nft.service';

@ApiTags('NFT')
@ApiSecurity('api_key', ['x-api-key'])
@Controller('nft')
export class ReadNftController {
  constructor(private readNftService: ReadNftService) {}

  @ApiOperation({ summary: 'Read all NFT' })
  @ApiOkResponse({
    description: 'Your all NFTs',
    schema: {
      example: {
        success: true,
        message: 'Your all NFTs',
        result: [
          {
            key: 4,
            updateAuthority: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
            mint: 'foMapernfZUpiro3qw7wRQ3221pmccU2oZ3iae9qjqG',
            data: {
              name: 'sample.jpg',
              symbol: 'NAT',
              uri: 'https://ipfs.io/ipfs/bafkreifjaa6nkxy57ebusnyqshac63l7er46j3bzeoc44dxyp3hu5s4sxy',
              sellerFeeBasisPoints: 0,
              creators: [
                {
                  address: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
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
            updateAuthority: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
            mint: 'HJ32KZye152eCFQYrKDcoyyq77dVDpa8SXE6v8T1HkBP',
            data: {
              name: 'Fish Eye',
              symbol: 'FYE',
              uri: 'https://ipfs.io/ipfs/bafkreigx7c3s267vty55xutwjkdmllugvwu2mhoowlcvx2nnhjl6k5kjaq',
              sellerFeeBasisPoints: 0,
              creators: [
                {
                  address: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
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
            updateAuthority: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
            mint: 'HBE5dEcFHiJtU8vmTyx7MhB43nFRMJt8ddC8Lupc3Jph',
            data: {
              name: 'NIELLY-Francoise-1.png',
              symbol: 'NW',
              uri: 'https://ipfs.io/ipfs/bafkreier6lmezc4aj4fud2xpf5kcxalvwkinklj27mgmnmifaoqmne4zzq',
              sellerFeeBasisPoints: 0,
              creators: [
                {
                  address: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
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
            updateAuthority: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
            mint: 'GE7sYdjDoxcqvsd7wzKf8tU2BWBzMDrD5j4eT45jDnJP',
            data: {
              name: 'Monkey NFT',
              symbol: 'MNK',
              uri: 'https://ipfs.io/ipfs/bafkreia5ilycpqhkug7dhfeskyi52yjbpbkqf5l23qodhyn547sakku7a4',
              sellerFeeBasisPoints: 0,
              creators: [
                {
                  address: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
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
            updateAuthority: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
            mint: 'DYitxNvtCHhcZHgGLxEsn2SChFfHMThFnZeP8zSCof1X',
            data: {
              name: 'Fish Eye',
              symbol: 'FYE',
              uri: 'https://ipfs.io/ipfs/bafkreigx7c3s267vty55xutwjkdmllugvwu2mhoowlcvx2nnhjl6k5kjaq',
              sellerFeeBasisPoints: 0,
              creators: [
                {
                  address: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
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
            updateAuthority: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
            mint: '9HKEL3uPD9wCKigNMUvH2kQhKAVwMfWhj3mr6zLwa7nC',
            data: {
              name: 'Camera',
              symbol: 'CAM',
              uri: 'https://ipfs.io/ipfs/bafkreigajd3rkbyn3dz4erjpcjyzyuyuyrdia5ehnlnbxhqpftn5bmbqji',
              sellerFeeBasisPoints: 0,
              creators: [
                {
                  address: '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
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
  })
  @Post('read_all')
  @HttpCode(200)
  async readAllNfts(@Body() readAllNftDto: ReadAllNftDto): Promise<any> {
    const result = await this.readNftService.readAllNfts(readAllNftDto);
    return {
      success: true,
      message: 'Your all NFTs',
      result,
    };
  }

  @ApiOperation({ summary: 'Read NFT' })
  @ApiOkResponse({
    description: 'NFT metadata',
    schema: {
      example: {
        success: true,
        message: 'NFT metadata',
        result: {
          pubkey: '7b7BNd9Nh1TZKSQzpgRWKXQZeKLkutC7Sv8WPqRwjGKu',
          info: {
            executable: false,
            owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
            lamports: 2853600,
            data: {
              type: 'Buffer',
              data: [
                6, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
              ],
            },
          },
          data: {
            key: 6,
            supply: '00',
            maxSupply: '01',
          },
        },
      },
    },
  })
  @Post('read')
  @HttpCode(200)
  async readNft(@Body() readNftDto: ReadNftDto): Promise<any> {
    const result = await this.readNftService.readNft(readNftDto);
    return {
      success: true,
      message: 'NFT metadata',
      result,
    };
  }
}
