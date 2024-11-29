import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SearchNftsDto } from './dto/search-nfts.dto';
import { SearchNftService } from './search-nft.service';
import { NftInfoAccessor } from 'src/dal/nft-repo/nft-info.accessor';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';

describe('SearchNftService', () => {
  let service: SearchNftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchNftService,
        NftInfoAccessor,
        {
          provide: getModelToken(NftInfo.name),
          useValue: Model, // <-- Use the Model Class from Mongoose
        },
      ],
    }).compile();

    service = module.get<SearchNftService>(SearchNftService);
  });

  it('should be defined', () => {
    const wallet = 'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R';
    const network = WalletAdapterNetwork.Devnet;
    const creators = [
      '5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg',
      '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
    ];
    const royalty = { gte: 5 };
    const attributes = { edification: { gte: '100' }, energy: '50' };
    const searchNftsDto = new SearchNftsDto(
      wallet,
      network,
      creators,
      royalty,
      attributes,
    );

    expect(service.createDbFilter(searchNftsDto)).toStrictEqual({
      $and: [
        { $expr: { $gte: [{ $toDouble: '$attributes.edification' }, 100] } },
      ],
      'attributes.energy': '50',
      creators: {
        $elemMatch: {
          address: {
            $in: [
              '5xSbS5PCkxPeZeJLHRBw57hMbCBNzSRoRaVfpQt5rxAg',
              '2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc',
            ],
          },
        },
      },
      network: 'devnet',
      owner: 'BFefyp7jNF5Xq2A4JDLLFFGpxLq5oPEFKBAQ46KJHW2R',
      royalty: { $gte: 500 },
    });
  });
});
