import { findAuctionHousePda, keypairIdentity, Metaplex, toBigNumber, toPublicKey } from "@metaplex-foundation/js";
import { HttpStatus, Injectable } from "@nestjs/common";
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { AccountUtils } from 'src/common/utils/account-utils';
import { CreateMarketPlaceAttachedDto } from "./dto/create-mp.dto";
import { NodeWallet } from "@metaplex/js";
import { NATIVE_MINT } from "@solana/spl-token";
import { MarketplaceCreationEvent, UpdateMarketplaceEvent } from "../helper/db-sync/db.events";
import { ObjectId } from "mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MarketplaceRepo } from "src/dal/marketplace-repo/marketplace-repo";
import { GetMarketplacesDto } from "./dto/get-mp.dto";
import { createWithdrawFromTreasuryInstruction, WithdrawFromTreasuryInstructionAccounts } from "@metaplex-foundation/mpl-auction-house";
import { WithdrawFeeAttachedDto } from "./dto/withdraw-royalty.dto";
import { UpdateMarketplaceAttachedDto } from "./dto/update-marketplace.dto";
import { newProgramError, newProgramErrorFrom, ProgramError } from "src/core/program-error";
import { MarketPlaceResponseDto, MarketplaceInfoResponseDto, TreasuryBalanceRespDto } from "./response-dto/responses.dto";
import { FindMarketplaceDto } from "./dto/find-marketplace.dto";
import { Utility } from "src/common/utils/utils";
import { GetTreasuryBalanceDto } from "./dto/treasury-balance.dto";
import { WalletService } from "../account/account.service";

class CreateMarketplaceServiceDto {
	apiKeyId: ObjectId;
	createMarketplaceParams: CreateMarketPlaceAttachedDto
}

type GetMpServiceDto = GetMarketplacesDto & {
	apiKeyId: ObjectId;
}

export type UpdateMpSerivceDto = {
	apiKeyId: ObjectId;
	update: UpdateMarketplaceAttachedDto;
}

@Injectable()
export class MarketplaceService {
	constructor(private eventEmitter: EventEmitter2, private marketplaceRepo: MarketplaceRepo, private walletService: WalletService) { }
	async createMarketPlace(createMarketPlaceDto: CreateMarketplaceServiceDto): Promise<MarketPlaceResponseDto> {
		try {
			const creatorKp = AccountUtils.getKeypair(createMarketPlaceDto.createMarketplaceParams.private_key);
			const wallet = new NodeWallet(creatorKp)
			const connection = Utility.connectRpc(createMarketPlaceDto.createMarketplaceParams.network);
			const metaplex = Metaplex.make(connection, { cluster: createMarketPlaceDto.createMarketplaceParams.network });
			const auctionsClient = metaplex.auctions();

			const transactionFee = createMarketPlaceDto.createMarketplaceParams.transaction_fee ?? 2

			const auctionHouse = await auctionsClient.createAuctionHouse({
				sellerFeeBasisPoints: transactionFee * 100,
				requiresSignOff: false,
				canChangeSalePrice: false,
				payer: wallet.payer,
				treasuryMint: createMarketPlaceDto.createMarketplaceParams.currency_address ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.currency_address) : NATIVE_MINT,
				authority: wallet.publicKey,
				feeWithdrawalDestination: createMarketPlaceDto.createMarketplaceParams.fee_payer ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.fee_payer) : wallet.publicKey,
				treasuryWithdrawalDestinationOwner: createMarketPlaceDto.createMarketplaceParams.fee_recipient ? new PublicKey(createMarketPlaceDto.createMarketplaceParams.fee_recipient) : wallet.publicKey
			}).run();

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
				treasury_address: auctionHouse.auctionHouse.treasuryAccountAddress.toBase58(),
				fee_payer: auctionHouse.auctionHouseFeeAccountAddress.toBase58(),
				fee_recipient_account: auctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
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
			const data = await this.marketplaceRepo.getMarketplacesByApiKeyId(getMpDto.network, getMpDto.apiKeyId);
			const result = data.map(d => {
				const resp: MarketplaceInfoResponseDto = {
					network: d.network,
					address: d.address,
					authority: d.authority,
					currency_address: d.currency_address,
					currency_symbol: d.currency_symbol,
					fee_payer: d.fee_payer,
					fee_recipient_account: d.fee_receipient,
					treasury_address: d.treasury_address,
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
			const auctionHouse = await Utility.auctionHouse.findAuctionHouse(findMarketplaceDto.network, auctionHousePda);
			const currencySymbol = await Utility.token.getTokenSymbol(findMarketplaceDto.network, findMarketplaceDto.currency_address);
			const resp: MarketPlaceResponseDto = {
				network: findMarketplaceDto.network,
				address: auctionHouse.address.toBase58(),
				currency_address: auctionHouse.treasuryMint.address.toBase58(),
				currency_symbol: currencySymbol,
				authority: auctionHouse.authorityAddress.toBase58(),
				fee_payer: auctionHouse.feeWithdrawalDestinationAddress.toBase58(),
				fee_recipient_account: auctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
				treasury_address: auctionHouse.treasuryAccountAddress.toBase58(),
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
			const connection = Utility.connectRpc(updateMarketplaceDto.update.network);
			const metaplex = Metaplex.make(connection, { cluster: updateMarketplaceDto.update.network });
			const auctionsClient = metaplex.auctions();
			const originalAuctionHouse = await auctionsClient.findAuctionHouseByAddress(new PublicKey(updateMarketplaceDto.update.marketplace_address)).run();

			if (callerKp.publicKey.toBase58() != originalAuctionHouse.authorityAddress.toBase58() &&
				callerKp.publicKey.toBase58() != originalAuctionHouse.creatorAddress.toBase58()) {
				throw newProgramError("updateAuctionHouse_Unauthorized_updater", HttpStatus.FORBIDDEN, "only the marketplace authority or the creator is allowed to update the marketplace", "", "mp-service_updateMarketplace", { updaterAddress: callerKp.publicKey.toBase58() })
			}

			metaplex.use(keypairIdentity(callerKp));
			const { auctionHouse: updatedAuctionHouse } = await metaplex.auctions().updateAuctionHouse(originalAuctionHouse, {
				sellerFeeBasisPoints: updateMarketplaceDto.update.transaction_fee ? updateMarketplaceDto.update.transaction_fee * 100 : originalAuctionHouse.sellerFeeBasisPoints,
				newAuthority: updateMarketplaceDto.update.new_authority_address ? toPublicKey(updateMarketplaceDto.update.new_authority_address) : originalAuctionHouse.authorityAddress,
				feeWithdrawalDestination: updateMarketplaceDto.update.fee_payer ? toPublicKey(updateMarketplaceDto.update.fee_payer) : originalAuctionHouse.feeWithdrawalDestinationAddress,
				treasuryWithdrawalDestinationOwner: updateMarketplaceDto.update.fee_recipient ? toPublicKey(updateMarketplaceDto.update.fee_recipient) : originalAuctionHouse.treasuryWithdrawalDestinationAddress,
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
				fee_recipient_account: updatedAuctionHouse.treasuryWithdrawalDestinationAddress.toBase58(),
				treasury_address: updatedAuctionHouse.treasuryAccountAddress.toBase58(),
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

	async withdrawFee(withdrawRoyaltyDto: WithdrawFeeAttachedDto) {
		try {
			const callerKp = AccountUtils.getKeypair(withdrawRoyaltyDto.private_key);
			const wallet = new NodeWallet(callerKp);
			const connection = Utility.connectRpc(withdrawRoyaltyDto.network);
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

	async getTreasuryBalance(getTreasuryBalance: GetTreasuryBalanceDto) {
		try {
			const marketplace = await this.marketplaceRepo.getMarketplacesByAddress(getTreasuryBalance.network, getTreasuryBalance.marketplace_address);
			let currencyAddress: string, currencySymbol: string, balance: number, connection: Connection, treasuryAccount: string, address: string;

			if (marketplace) {
				currencyAddress = marketplace.currency_address;
				currencySymbol = marketplace.currency_symbol;
				treasuryAccount = marketplace.treasury_address;
				address = marketplace.address;
			} else {
				const connection = Utility.connectRpc(getTreasuryBalance.network);
				const metaplex = Metaplex.make(connection, { cluster: getTreasuryBalance.network });
				const auctionsClient = metaplex.auctions();
				const auctionHouse = await auctionsClient.findAuctionHouseByAddress(new PublicKey(getTreasuryBalance.marketplace_address)).run();
				currencyAddress = auctionHouse.treasuryMint.address.toBase58();
				treasuryAccount = auctionHouse.treasuryAccountAddress.toBase58();
				address = auctionHouse.address.toBase58();
			}

			if (currencyAddress == NATIVE_MINT.toBase58()) {
				balance = await connection.getBalance(toPublicKey(treasuryAccount));
				currencySymbol = 'SOL'
				balance = balance / LAMPORTS_PER_SOL;
			} else {
				const tb = await this.walletService.getAllTokensBalance({
					network: getTreasuryBalance.network,
					wallet: address
				})
				tb.forEach(e => {
					if (e.address == currencyAddress) {
						balance = e.balance;
						return;
					}
				});
			}

			currencySymbol = currencySymbol ?? await Utility.token.getTokenSymbol(getTreasuryBalance.network, currencyAddress);
			const resp: TreasuryBalanceRespDto = {
				amount: balance,
				symbol: currencySymbol
			}

			return resp;
		} catch (err) {
			throw newProgramErrorFrom(err, "get_treasury_balance_error");
		}
	}
}

