//update attributes value type to hold objects also

import { isNull, isObject, omitBy } from 'lodash';
import { NftInfo } from 'src/dal/nft-repo/nft-info.schema';

export interface NftApiResponse {
  name: string;
  description: string;
  symbol: string;
  image_uri: string;
  royalty: number;
  mint: string;
  attributes: { [k: string]: string | number };
  owner: string;
  update_authority: string;
  cached_image_uri: string;
  metadata_uri: string;
  creators: any;
  collection: any;
  attributes_array: any;
  files: any;
  external_url: string;
  is_loaded_metadata: boolean;
}

export function getApiResponseFromNftInfo(r: NftInfo): NftApiResponse {
  const response: NftApiResponse = {
    name: r.name,
    symbol: r.symbol,
    royalty: r.royalty / 100,
    image_uri: r.image_uri,
    cached_image_uri: r.cached_image_uri ?? r.image_uri,
    metadata_uri: r.metadata_uri,
    description: r.description,
    mint: r.mint,
    owner: r.owner,
    update_authority: r.update_authority,
    creators: r.creators,
    collection: r.collection_data ? omitBy(r.collection_data, isNull) : {},
    attributes: r.attributes,
    attributes_array: [],
    files: r.files,
    external_url: r.external_url,
    is_loaded_metadata: r.is_loaded_metadata,
  };
  if (isObject(r.attributes)) {
    const keys = Object.keys(r.attributes);
    for (const key of keys) {
      response.attributes_array.push({
        trait_type: key,
        value: r.attributes[key],
      });
    }
  }

  return response;
}
