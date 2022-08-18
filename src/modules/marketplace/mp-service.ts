import { Metaplex } from "@metaplex-foundation/js";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { AccountUtils } from 'src/common/utils/account-utils';
import { CreateMarketPlaceDto } from "./dto/create-mp.dto";
import { NodeWallet } from "@metaplex/js";
import { NATIVE_MINT } from "@solana/spl-token";
import { MarketplaceCreationEvent } from "../helper/db-sync/db.events";
import { ObjectId } from "mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MarketplaceRepo } from "src/dal/marketplace-repo/marketplace-repo";
import { GetMarketplacesDto } from "./dto/get-mp.dto";

class CreateMarketplaceServiceDto {
	apiKeyId: ObjectId;
	createMarketplaceParams: CreateMarketPlaceDto
}

type GetMpServiceDto = GetMarketplacesDto & {
	apiKeyId: ObjectId;
}

class MarketplaceResponseDto {
	network: string;
	marketplace_address: string;
	currency_address: string;
	create_at: Date;
	updated_at: Date;
}

@Injectable()
export class MarketplaceService {
	constructor(private eventEmitter: EventEmitter2, private marketplaceRepo: MarketplaceRepo) { }
	async createMarketPlace(createMarketPlaceDto: CreateMarketplaceServiceDto): Promise<any> {
		try {
			const creatorKp = AccountUtils.getKeypair(createMarketPlaceDto.createMarketplaceParams.private_key);
			const wallet = new NodeWallet(creatorKp)
			const connection = new Connection(clusterApiUrl(createMarketPlaceDto.createMarketplaceParams.network), 'confirmed');
			const metaplex = Metaplex.make(connection, { cluster: createMarketPlaceDto.createMarketplaceParams.network });
			const auctionsClient = metaplex.auctions();

			const auctionHouse = await auctionsClient.createAuctionHouse({
				sellerFeeBasisPoints: createMarketPlaceDto.createMarketplaceParams.marketplace_royalty ? createMarketPlaceDto.createMarketplaceParams.marketplace_royalty : 0,
				requiresSignOff: false,
				canChangeSalePrice: false,
				payer: wallet.payer,
				treasuryMint: createMarketPlaceDto.createMarketplaceParams.marketplace_currency ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.marketplace_currency) : NATIVE_MINT,
				authority: createMarketPlaceDto.createMarketplaceParams.update_authority ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.update_authority) : wallet.publicKey,
				feeWithdrawalDestination: createMarketPlaceDto.createMarketplaceParams.fee_payer ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.fee_payer) : wallet.publicKey,
				treasuryWithdrawalDestinationOwner: createMarketPlaceDto.createMarketplaceParams.royalty_withdraw_owner ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.royalty_withdraw_owner) : wallet.publicKey
			}).run();

			const marketplaceCreationEvent = new MarketplaceCreationEvent(
				createMarketPlaceDto.createMarketplaceParams.network,
				auctionHouse.auctionHouseAddress.toBase58(),
				auctionHouse.auctionHouse.treasuryMint.address.toBase58(),
				createMarketPlaceDto.apiKeyId
			);

			this.eventEmitter.emit('marketplace.created', marketplaceCreationEvent);
			return {
				auction_house: auctionHouse
			}
		} catch (err) {
			console.log(err.message)
			throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async getMarketplaces(getMpDto: GetMpServiceDto): Promise<MarketplaceResponseDto[]> {
		try {
			const data = await this.marketplaceRepo.getMarketplaces(getMpDto.network, getMpDto.apiKeyId);
			const result = data.map(d => {
				const resp: MarketplaceResponseDto = {
					network: d.network,
					marketplace_address: d.marketplace_address,
					currency_address: d.currency_address,
					create_at: d.created_at,
					updated_at: d.updated_at,
				}
				return resp;
			});
			return result;
		} catch (err) {
			console.log(err);
			throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}

