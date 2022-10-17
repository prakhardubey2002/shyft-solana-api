import { Injectable } from '@nestjs/common';
import { NFTStorage, Blob } from 'nft.storage';
import { configuration } from 'src/common/configs/config';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { CreateTokenMetadataDto } from './dto/create-token-metadata.dto';

const storageClient = new NFTStorage({
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGZGMUMyQ0IxY2M4ZUI2OWE1MDVEZDM5YjU1NGUwQUM0RkJCMWY2QjAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MjM4Mzk3OTUyNywibmFtZSI6InNoeWZ0In0.Yu2UPw5UBCsddrE4-fdcIp8oPiVy0VjTlSTJgku-EUw',
});

interface IpfsUploadResponse {
  cid: string;
  uri: string;
}

@Injectable()
export class StorageMetadataService {
  async uploadToIPFS(file: Blob): Promise<IpfsUploadResponse> {
    const ipfstx = await storageClient.storeBlob(file);
    return { cid: ipfstx, uri: `${configuration().ipfsGateway}` + `${ipfstx}` };
  }

  async prepareNFTMetadata(createMetadataDto: CreateMetadataDto): Promise<any> {
    const { creator, image, name, description, symbol, attributes, share, royalty, external_url, file } =
      createMetadataDto;

    const metadata = {
      name,
      symbol,
      description,
      seller_fee_basis_points: royalty ? royalty : 0,
      external_url: external_url ? external_url : '',
      image,
      attributes,
      properties: {
        creators: [{ address: creator, verified: true, share }],
      },
    };

    if (file) metadata.properties['files'] = [file]; // add files key to metadata obj

    const metadataSting = JSON.stringify(metadata);
    const uploadResponse = await this.uploadToIPFS(new Blob([metadataSting], { type: 'application/json' }));
    return uploadResponse;
  }

  async prepareTokenMetadata(createTokenMetadataDto: CreateTokenMetadataDto): Promise<any> {
    const { name, symbol, description, image } = createTokenMetadataDto;

    const metadata = JSON.stringify({
      name,
      symbol,
      description: description ?? 'Created with Shyft.to',
      image, //set shyft logo as default
    });

    const uploadResponse = await this.uploadToIPFS(new Blob([metadata], { type: 'application/json' }));
    return uploadResponse;
  }
}
