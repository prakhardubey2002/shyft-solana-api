import { isObject } from "class-validator";
import { NftDbResponse } from "src/modules/data-cache/remote-data-fetcher/dto/data-fetcher.dto";
import { NftInfoDocument } from "./nft-info.schema";

export function getNftDbResponseFromNftInfo(r: NftInfoDocument): NftDbResponse {

  const response = {
    name: r.name,
    symbol: r.symbol,
    royalty: r.royalty / 100,
    image_uri: r.image_uri,
    cached_image_uri: r.cached_image_uri ?? r.image_uri,
    metadata_uri: r.metadata_uri,
    description: r.description,
    mint: r.mint,
    owner: r.owner,
    creators: r.creators,
    attributes: r.attributes,
    attributes_array: [],
    files: r.files,
    update_authority: r.update_authority,
  };
  if (isObject(r.attributes)) {
    const keys = Object.keys(r.attributes);
    for (const key of keys) {
      response.attributes_array.push({ trait_type: key, value: r.attributes[key] })
    }
  }
  
  return response;
}
