import { Injectable } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { GetAllMintsDto, GetAllMintsInfoDto } from './dto/candy-machine.dto';
import * as bs58 from 'bs58';
import { Utility } from 'src/common/utils/utils';
import { RemoteDataFetcherService } from 'src/modules/data-cache/remote-data-fetcher/data-fetcher.service';
import { toPublicKey } from '@metaplex-foundation/js';
import { FetchNftsByMintListDto } from 'src/modules/data-cache/remote-data-fetcher/dto/data-fetcher.dto';
import { getApiResponseFromNftInfo, NftApiResponse } from 'src/modules/nft/nft-response-dto';

export const CANDY_MACHINE_V2_PROGRAM = new PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ');

@Injectable()
export class CandyMachineService {
  constructor(private remoteDataFetcher: RemoteDataFetcherService) {}

  async getAllMints(dto: GetAllMintsDto) {
    const { network, address } = dto;
    const connection = Utility.connectRpc(network);
    const candyMachineId = new PublicKey(address);
    const creator = await this.getCandyMachineCreator(candyMachineId);
    const mints = await this.getAllMintAddresses(connection, creator);
    return mints;
  }

  private async getCandyMachineCreator(candyMachine: PublicKey): Promise<PublicKey> {
    const creator = await PublicKey.findProgramAddress(
      [Buffer.from('candy_machine'), candyMachine.toBuffer()],
      CANDY_MACHINE_V2_PROGRAM,
    );
    return creator[0];
  }

  private async getAllMintAddresses(connection: Connection, firstCreatorAddress: PublicKey): Promise<string[]> {
    const MAX_NAME_LENGTH = 32;
    const MAX_URI_LENGTH = 200;
    const MAX_SYMBOL_LENGTH = 10;
    const MAX_CREATOR_LEN = 32 + 1 + 1;
    const MAX_CREATOR_LIMIT = 5;
    const MAX_DATA_SIZE =
      4 +
      MAX_NAME_LENGTH +
      4 +
      MAX_SYMBOL_LENGTH +
      4 +
      MAX_URI_LENGTH +
      2 +
      1 +
      4 +
      MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
    const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172;
    const CREATOR_ARRAY_START =
      1 + 32 + 32 + 4 + MAX_NAME_LENGTH + 4 + MAX_URI_LENGTH + 4 + MAX_SYMBOL_LENGTH + 2 + 1 + 4;

    const metadataAccounts = await connection.getProgramAccounts(PROGRAM_ID, {
      // The mint address is located at byte 33 and lasts for 32 bytes.
      dataSlice: { offset: 33, length: 32 },

      filters: [
        // Only get Metadata accounts.
        { dataSize: MAX_METADATA_LEN },

        // Filter using the first creator.
        {
          memcmp: {
            offset: CREATOR_ARRAY_START,
            bytes: firstCreatorAddress.toBase58(),
          },
        },
      ],
    });

    const mints = metadataAccounts.map((metadataAccountInfo) => bs58.encode(metadataAccountInfo.account.data));
    return mints;
  }

  async getInfo(
    dto: GetAllMintsInfoDto,
  ): Promise<{ nfts: NftApiResponse[]; page: number; size: number; total_data: number; total_page: number }> {
    const { network, address } = dto;
    let { page, size } = dto;
    if (!page) page = 1;
    if (!size) size = 10;
    const mints = await this.getAllMints({ network, address });
    const paginatedMints = mints.slice((page - 1) * size, page * size);
    const paginatedMintPubKeys = paginatedMints.map((x) => toPublicKey(x));
    const fetchNftsByMintListDto = new FetchNftsByMintListDto(network, paginatedMintPubKeys);
    const nfts = await this.remoteDataFetcher.fetchNftsByMintList(fetchNftsByMintListDto);
    const response = nfts.map((nft) => getApiResponseFromNftInfo(nft.getNftInfoDto()));
    const totalData = mints.length;
    const totalPage = Math.ceil(totalData / size);
    return { nfts: response, page, size, total_data: totalData, total_page: totalPage };
  }
}
