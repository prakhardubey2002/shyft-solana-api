import { findAssociatedTokenAccountPda, findAuctionHousePda, keypairIdentity, Metaplex, toBigNumber, toPublicKey } from "@metaplex-foundation/js";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { AccountUtils } from 'src/common/utils/account-utils';
import { CreateMarketPlaceDto } from "./dto/create-mp.dto";
import { NodeWallet } from "@metaplex/js";
import { NATIVE_MINT } from "@solana/spl-token";
import { MarketplaceCreationEvent, UpdateMarketplaceEvent } from "../helper/db-sync/db.events";
import { ObjectId } from "mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MarketplaceRepo } from "src/dal/marketplace-repo/marketplace-repo";
import { GetMarketplacesDto } from "./dto/get-mp.dto";
import { createWithdrawFromTreasuryInstruction, WithdrawFromTreasuryInstructionAccounts } from "@metaplex-foundation/mpl-auction-house";
import { WithdrawFeeDto } from "./dto/withdraw-royalty.dto";
import { UpdateMarketplaceDto } from "./dto/update-marketplace.dto";
import { newProgramError, newProgramErrorFrom, ProgramError } from "src/core/program-error";
import { MarketPlaceResponseDto, MarketplaceInfoResponseDto } from "./response-dto/responses.dto";
import { FindMarketplaceDto } from "./dto/find-marketplace.dto";
import { Utility } from "src/common/utils/utils";

class CreateMarketplaceServiceDto {
	apiKeyId: ObjectId;
	createMarketplaceParams: CreateMarketPlaceDto
}

type GetMpServiceDto = GetMarketplacesDto & {
	apiKeyId: ObjectId;
}

export type UpdateMpSerivceDto = {
	apiKeyId: ObjectId;
	update: UpdateMarketplaceDto;
}

@Injectable()
export class MarketplaceService {
	constructor(private eventEmitter: EventEmitter2, private marketplaceRepo: MarketplaceRepo) { }
	async createMarketPlace(createMarketPlaceDto: CreateMarketplaceServiceDto): Promise<MarketPlaceResponseDto> {
		try {
			const creatorKp = AccountUtils.getKeypair(createMarketPlaceDto.createMarketplaceParams.private_key);
			const wallet = new NodeWallet(creatorKp)
			const connection = new Connection(clusterApiUrl(createMarketPlaceDto.createMarketplaceParams.network), 'confirmed');
			const metaplex = Metaplex.make(connection, { cluster: createMarketPlaceDto.createMarketplaceParams.network });
			const auctionsClient = metaplex.auctions();

			const auctionHouse = await auctionsClient.createAuctionHouse({
				sellerFeeBasisPoints: createMarketPlaceDto.createMarketplaceParams.transaction_fee ? createMarketPlaceDto.createMarketplaceParams.transaction_fee * 100 : 0,
				requiresSignOff: false,
				canChangeSalePrice: false,
				payer: wallet.payer,
				treasuryMint: createMarketPlaceDto.createMarketplaceParams.currency_address ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.currency_address) : NATIVE_MINT,
				authority: createMarketPlaceDto.createMarketplaceParams.update_authority ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.update_authority) : wallet.publicKey,
				feeWithdrawalDestination: createMarketPlaceDto.createMarketplaceParams.fee_payer ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.fee_payer) : wallet.publicKey,
				treasuryWithdrawalDestinationOwner: createMarketPlaceDto.createMarketplaceParams.fee_receipient ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.fee_receipient) : wallet.publicKey
			}).run();

			const transactionFee = auctionHouse.auctionHouse.sellerFeeBasisPoints / 100;
			const currencySymbol = await Utility.token.getTokenSymbol(createMarketPlaceDto.createMarketplaceParams.network, auctionHouse.auctionHouse.treasuryMint.address.toBase58());
			const marketplaceCreationEvent = new MarketplaceCreationEvent(
				createMarketPlaceDto.createMarketplaceParams.network,
				auctionHouse.auctionHouseAddress.toBase58(),
				auctionHouse.auctionHouse.authorityAddress.toBase58(),
				auctionHouse.auctionHouse.treasuryMint.address.toBase58(),
				auctionHouse.auctionHouseFeeAccountAddress.toBase58(),
				auctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
				auctionHouse.auctionHouse.treasuryAccountAddress.toBase58(),
				auctionHouse.auctionHouse.creatorAddress.toBase58(),
				transactionFee,
				currencySymbol,
				createMarketPlaceDto.apiKeyId);
			this.eventEmitter.emit('marketplace.created', marketplaceCreationEvent);

			const resp: MarketPlaceResponseDto = {
				network: createMarketPlaceDto.createMarketplaceParams.network,
				address: auctionHouse.auctionHouseAddress.toBase58(),
				fee_holder_account: auctionHouse.auctionHouse.treasuryAccountAddress.toBase58(),
				fee_payer: auctionHouse.auctionHouseFeeAccountAddress.toBase58(),
				fee_receipient: auctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
				currency_address: auctionHouse.auctionHouse.treasuryMint.address.toBase58(),
				currency_symbol: currencySymbol,
				creator: auctionHouse.auctionHouse.creatorAddress.toBase58(),
				transaction_fee: transactionFee,
				authority: auctionHouse.auctionHouse.authorityAddress.toBase58(),
			}
			return resp;
		} catch (err) {
			throw newProgramErrorFrom(err, "mp_creation_error");
		}
	}

	async getMarketplaces(getMpDto: GetMpServiceDto): Promise<MarketplaceInfoResponseDto[]> {
		try {
			const data = await this.marketplaceRepo.getMarketplaces(getMpDto.network, getMpDto.apiKeyId);
			const result = data.map(d => {
				const resp: MarketplaceInfoResponseDto = {
					network: d.network,
					address: d.address,
					authority: d.authority,
					currency_address: d.currency_address,
					currency_symbol: d.currency_symbol,
					fee_payer: d.fee_payer,
					fee_receipient: d.fee_receipeint,
					fee_holder_account: d.fee_holder_account,
					creator: d.creator,
					transaction_fee: d.transaction_fee,
					created_at: d.created_at,
					updated_at: d.updated_at,
				}
				return resp;
			});
			return result;
		} catch (err) {
			throw newProgramErrorFrom(err, "mp_fetch_error");
		}
	}

	async findMarketplace(findMarketplaceDto: FindMarketplaceDto) {
		try {
			const auctionHousePda = findAuctionHousePda(
				toPublicKey(findMarketplaceDto.creator_address),
				toPublicKey(findMarketplaceDto.currency_address));

			const connection = new Connection(clusterApiUrl(findMarketplaceDto.network), 'confirmed');
			const metaplex = Metaplex.make(connection, { cluster: findMarketplaceDto.network });
			const auctionsClient = metaplex.auctions();
			const auctionHouse = await auctionsClient.findAuctionHouseByAddress(auctionHousePda).run();

			const currencySymbol = await Utility.token.getTokenSymbol(findMarketplaceDto.network, findMarketplaceDto.currency_address);
			const resp: MarketPlaceResponseDto = {
				network: findMarketplaceDto.network,
				address: auctionHouse.address.toBase58(),
				currency_address: auctionHouse.treasuryMint.address.toBase58(),
				currency_symbol: currencySymbol,
				authority: auctionHouse.authorityAddress.toBase58(),
				fee_payer: auctionHouse.feeWithdrawalDestinationAddress.toBase58(),
				fee_receipient: auctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
				fee_holder_account: auctionHouse.treasuryAccountAddress.toBase58(),
				creator: auctionHouse.creatorAddress.toBase58(),
				transaction_fee: auctionHouse.sellerFeeBasisPoints / 100
			}
			return resp;
		} catch (err) {
			throw newProgramErrorFrom(err);
		}
	}

	async updateAuctionHouse(updateMarketplaceDto: UpdateMpSerivceDto) {
		try {
			const callerKp = AccountUtils.getKeypair(updateMarketplaceDto.update.private_key);
			const connection = new Connection(clusterApiUrl(updateMarketplaceDto.update.network), 'confirmed');
			const metaplex = Metaplex.make(connection, { cluster: updateMarketplaceDto.update.network });
			const auctionsClient = metaplex.auctions();
			const originalAuctionHouse = await auctionsClient.findAuctionHouseByAddress(new PublicKey(updateMarketplaceDto.update.marketplace_address)).run();

			if (callerKp.publicKey.toBase58() != originalAuctionHouse.authorityAddress.toBase58() &&
				callerKp.publicKey.toBase58() != originalAuctionHouse.creatorAddress.toBase58()) {
				throw newProgramError("updateAuctionHouse_Unauthorized_updater", HttpStatus.FORBIDDEN, "only the marketplace authority or the creator is allowed to update the marketplace", "", "mp-service_updateMarketplace", { updaterAddress: callerKp.publicKey.toBase58() })
			}

			metaplex.use(keypairIdentity(callerKp));
			const { auctionHouse: updatedAuctionHouse } = await metaplex.auctions().updateAuctionHouse(originalAuctionHouse, {
				sellerFeeBasisPoints: updateMarketplaceDto.update.new_marketplace_fee ? updateMarketplaceDto.update.new_marketplace_fee * 100 : originalAuctionHouse.sellerFeeBasisPoints,
				newAuthority: updateMarketplaceDto.update.new_authority_address ? toPublicKey(updateMarketplaceDto.update.new_authority_address) : originalAuctionHouse.authorityAddress,
				feeWithdrawalDestination: updateMarketplaceDto.update.new_fee_payer ? toPublicKey(updateMarketplaceDto.update.new_fee_payer) : originalAuctionHouse.feeWithdrawalDestinationAddress,
				treasuryWithdrawalDestinationOwner: updateMarketplaceDto.update.new_fee_receipient ? toPublicKey(updateMarketplaceDto.update.new_fee_receipient) : originalAuctionHouse.treasuryWithdrawalDestinationAddress,
			}).run();

			const updatedTransactionFee = updatedAuctionHouse.sellerFeeBasisPoints / 100;
			const currencySymbol = await Utility.token.getTokenSymbol(updateMarketplaceDto.update.network, updatedAuctionHouse.treasuryMint.address.toBase58())

			const marketUpdateEvent = new UpdateMarketplaceEvent(
				updatedAuctionHouse.address.toBase58(),
				updatedAuctionHouse.treasuryMint.address.toBase58(),
				currencySymbol,
				updatedAuctionHouse.feeWithdrawalDestinationAddress.toBase58(),
				updatedAuctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
				updatedTransactionFee,
				updatedAuctionHouse.authorityAddress.toBase58(),
				updatedAuctionHouse.creatorAddress.toBase58(),
				updateMarketplaceDto.apiKeyId,
				updatedAuctionHouse.canChangeSalePrice,
				updatedAuctionHouse.requiresSignOff
			)
			this.eventEmitter.emit('marketplace.updated', marketUpdateEvent);

			const result: MarketPlaceResponseDto = {
				network: updateMarketplaceDto.update.network,
				address: updatedAuctionHouse.address.toBase58(),
				currency_address: updatedAuctionHouse.treasuryMint.address.toBase58(),
				currency_symbol: currencySymbol,
				authority: updatedAuctionHouse.authorityAddress.toBase58(),
				fee_payer: updatedAuctionHouse.feeWithdrawalDestinationAddress.toBase58(),
				fee_receipient: updatedAuctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
				fee_holder_account: updatedAuctionHouse.treasuryAccountAddress.toBase58(),
				creator: updatedAuctionHouse.creatorAddress.toBase58(),
				transaction_fee: updatedTransactionFee,
			}
			return result;
		} catch (err) {
			if (err instanceof ProgramError) {
				throw err
			} else {
				throw newProgramErrorFrom(err, "updateAuctionHouse_error");
			}
		}
	}

	async withdrawFee(withdrawRoyaltyDto: WithdrawFeeDto) {
		try {
			const callerKp = AccountUtils.getKeypair(withdrawRoyaltyDto.private_key);
			const wallet = new NodeWallet(callerKp);
			const connection = new Connection(clusterApiUrl(withdrawRoyaltyDto.network), 'confirmed');
			const metaplex = Metaplex.make(connection, { cluster: withdrawRoyaltyDto.network });
			const auctionsClient = metaplex.auctions();
			const auctionHouse = await auctionsClient.findAuctionHouseByAddress(new PublicKey(withdrawRoyaltyDto.marketplace_address)).run();

			if (callerKp.publicKey.toBase58() != auctionHouse.authorityAddress.toBase58()) {
				throw newProgramError("withdrawFee_Unauthorized_withdrawal", HttpStatus.FORBIDDEN, "only the marketplace authority is allowed to withdraw funds from the marketplace", "", "mp-service_withdrawFee", { withdrawer_address: callerKp.publicKey.toBase58() })
			}

			const instructionAccounts: WithdrawFromTreasuryInstructionAccounts = {
				treasuryMint: auctionHouse.treasuryMint.address,
				authority: auctionHouse.authorityAddress,
				treasuryWithdrawalDestination: auctionHouse.treasuryWithdrawalDestinationAddress,
				auctionHouseTreasury: auctionHouse.treasuryAccountAddress,
				auctionHouse: auctionHouse.address
			}
			const withdrawAmount = toBigNumber(withdrawRoyaltyDto.amount * Math.pow(10, auctionHouse.treasuryMint.decimals));

			const instruction = createWithdrawFromTreasuryInstruction(instructionAccounts, { amount: withdrawAmount })
			const txt = new Transaction().add(instruction);
			txt.feePayer = wallet.publicKey;
			txt.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
			const signedTx = await wallet.signTransaction(txt);
			const txId = await connection.sendRawTransaction(signedTx.serialize());
			return {
				transaction_id: txId,
				from: auctionHouse.treasuryAccountAddress.toBase58(),
				to: auctionHouse.treasuryWithdrawalDestinationAddress.toBase58()
			}
		} catch (err) {
			if (err instanceof ProgramError) {
				throw err
			} else {
				throw newProgramErrorFrom(err, "mp_withdraw_fee_error");
			}
		}
	}
}

