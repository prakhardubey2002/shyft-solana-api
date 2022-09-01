import { NftDbResponse } from "src/modules/helper/remote-data-fetcher/dto/data-fetcher.dto";
import { NftInfoDocument } from "./nft-info.schema";

export function getNftDbResponseFromNftInfo(r: NftInfoDocument): NftDbResponse {
  let cachedImageUri = encodeURI(r.cached_image_uri);
  if (cachedImageUri === 'undefined' || cachedImageUri === 'null') {
    cachedImageUri = r.image_uri;
  }
  const response = {
    name: r.name,
    symbol: r.symbol,
    royalty: r.royalty / 100,
    image_uri: r.image_uri,
    cached_image_uri: cachedImageUri,
    description: r.description,
    mint: r.mint,
    owner: r.owner,
    attributes: r.attributes,
    files: r.files,
    update_authority: r.update_authority,
  };
  
  return response;
}
