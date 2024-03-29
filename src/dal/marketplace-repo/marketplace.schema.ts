import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { ObjectId } from 'mongoose';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export type MarketplaceDocument = Marketplace & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Marketplace {
  constructor(
    apiKeyId?: ObjectId,
    network?: WalletAdapterNetwork,
    marketplaceAddress?: string,
    feeAccount?: string,
    currencyAddress?: string,
    feePayer?: string,
    treasuryWithdrawalDestinationOwner?: string,
    treasuryWithdrawalDestination?: string,
    treasuryAddress?: string,
    transactionFee?: number,
    creator?: string,
    symbol?: string,
    authority?: string,
    canChangePrice?: boolean,
    requireSignOff?: boolean,
  ) {
    if (apiKeyId) {
      this.api_key_id = apiKeyId;
    }
    if (network) {
      this.network = network;
    }
    if (feeAccount) {
      this.fee_account = feeAccount;
    }
    if (marketplaceAddress) {
      this.address = marketplaceAddress;
    }
    if (currencyAddress) {
      this.currency_address = currencyAddress;
    }
    if (feePayer) {
      this.fee_payer = feePayer;
    }
    if (treasuryWithdrawalDestinationOwner) {
      this.treasury_withdrawal_destination_owner = treasuryWithdrawalDestinationOwner;
    }
    if (treasuryWithdrawalDestination) {
      this.treasury_withdrawal_destination = treasuryWithdrawalDestination;
    }
    if (transactionFee) {
      this.transaction_fee = transactionFee;
    }
    if (treasuryAddress) {
      this.treasury_address = treasuryAddress;
    }
    if (creator) {
      this.creator = creator;
    }
    if (requireSignOff) {
      this.requires_sign_off = requireSignOff ? requireSignOff : false;
    }
    if (canChangePrice) {
      this.can_change_sale_price = canChangePrice ? canChangePrice : false;
    }
    if (authority) {
      this.authority = authority;
    }
    this.currency_symbol = symbol ? symbol : 'SOL';
  }

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, default: null })
  api_key_id: ObjectId;

  @Prop({ required: true, default: 'devnet' })
  network: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  authority: string;

  @Prop({ required: true })
  currency_address: string;

  @Prop({ required: true, default: 'SOL' })
  currency_symbol: string;

  @Prop({ required: true })
  fee_account: string;

  @Prop({ required: true })
  fee_payer: string;

  @Prop({ required: true })
  treasury_withdrawal_destination_owner: string;

  @Prop({ required: true })
  treasury_withdrawal_destination: string;

  @Prop({ required: true })
  treasury_address: string;

  @Prop({ required: true })
  creator: string;

  @Prop({ required: true })
  transaction_fee: number;

  @Prop({ required: false, default: false })
  can_change_sale_price: boolean;

  @Prop({ required: false, default: false })
  requires_sign_off: boolean;

  @Prop({ required: false })
  created_at: Date;

  @Prop({ required: false })
  updated_at: Date;

  //improve the logic for treasury_withdrawal_destination_owner
  public isEqual(mpDoc: MarketplaceDocument): boolean {
    if (!mpDoc) return false;
    if (
      this.network != mpDoc.network ||
      this.address != mpDoc.address ||
      this.authority != mpDoc.authority ||
      this.transaction_fee != mpDoc.transaction_fee ||
      this.fee_payer != mpDoc.fee_payer ||
      this.treasury_withdrawal_destination_owner != mpDoc.treasury_withdrawal_destination_owner
    ) {
      return false;
    }
    return true;
  }
}

export const MarketPlaceSchema = SchemaFactory.createForClass(Marketplace);
