import { Injectable } from '@nestjs/common';
import { isArray } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NftInfoAccessor } from 'src/dal/nft-repo/nft-info.accessor';
import { getApiResponseFromNftInfo } from '../../nft-response-dto';
import { SearchNftsDto } from './dto/search-nfts.dto';

@Injectable()
export class SearchNftService {
  constructor(private nftInfoAccessor: NftInfoAccessor) {}
  async searchNftsByAttributes(query: any, apiKeyId: ObjectId): Promise<any> {
    const filter = {};
    for (const key in query) {
      const k = 'attributes.' + key;
      const n = parseInt(query[key]);
      if (!isNaN(n)) {
        filter[k] = n;
      } else {
        filter[k] = query[key];
      }
    }

    filter['api_key_id'] = apiKeyId;
    const filteredResult = await this.nftInfoAccessor.find(filter);
    const result = filteredResult.map((r) => {
      return getApiResponseFromNftInfo(r);
    });

    return result;
  }

  async searchNfts(searchNftDto: SearchNftsDto): Promise<any> {
    let { page, size } = searchNftDto;
    if (!page) page = 1;
    if (!size) size = 10;

    const filter = this.createDbFilter(searchNftDto);

    const totalData = await this.nftInfoAccessor.count(filter);
    const totalPage = Math.ceil(totalData / size);
    const filteredResult = await this.nftInfoAccessor.find(filter, page, size);

    const nfts = filteredResult.map((r) => {
      return getApiResponseFromNftInfo(r);
    });

    return { nfts, page, size, total_data: totalData, total_page: totalPage };
  }

  createDbFilter(searchNftDto: SearchNftsDto) {
    const { network, wallet, creators, attributes, royalty } = searchNftDto;
    const filter = {};
    const searchExp = [];
    for (const key in attributes) {
      const k = 'attributes.' + key;
      const n = attributes[key];
      if (!isNaN(n)) {
        filter[k] = n;
      } else {
        if (typeof attributes[key] === 'object') {
          // handle 'gt'/'lt'/'gte'/'lte' operation and mold as mongoose operation
          const searchValue = Object.values(attributes[key])[0] as string;
          const searchMethod = `$${Object.keys(attributes[key])[0]}`;
          // push 'gt'/'lt'/'gte'/'lte' operation
          searchExp.push({
            $expr: {
              [searchMethod]: [{ $toDouble: `$${k}` }, parseInt(searchValue)],
            },
          });
        } else {
          filter[k] = attributes[key];
        }
      }
    }
    if (searchExp.length > 0) {
      // include extra ops if included
      Object.assign(filter, { $and: searchExp });
    }
    if (royalty) {
      if (typeof royalty === 'object') {
        const searchMethod = `$${Object.keys(royalty)[0]}`;
        const searchValue = Object.values(royalty)[0] * 100; // royalty to sellerFeeBasisPoint
        filter['royalty'] = { [searchMethod]: searchValue };
      } else {
        filter['royalty'] = royalty * 100;
      }
    }
    if (network) filter['network'] = network;
    if (wallet) filter['owner'] = wallet;
    if (isArray(creators)) {
      filter['creators'] = { $elemMatch: { address: { $in: creators } } };
    }
    return filter;
  }
}
