import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export class MarketPlaceResponseDto {
	network: string;
	address: string;
	currency_address: string;
	currency_symbol: string;
	authority: string;
	fee_payer: string;
	fee_receipient: string;
	fee_holder_account: string;
	creator: string;
	transaction_fee: number;
}

export type MarketplaceInfoResponseDto = MarketPlaceResponseDto & {
	created_at: Date;
	updated_at?: Date;
}

export class ListingCreationResponseDto {
	network: string;
	marketplace_address: string;
	seller_address: string;
	price: number;
	nft_address: string;
	list_state: string;
	currency_symbol: string;
	receipt?: string;
	created_at: Date;
}

export class BuyResponseDto {
	network: string;
	marketplace_address: string;
	seller_address: string;
	price: number;
	nft_address: string;
	currency_symbol: string;
	purchase_receipt: string;
	buyer_address: string;
	purchased_at: Date;
}

export class ListingInfoResponseDto {
	network: string;
	marketplace_address: string;
	seller_address: string;
	price: number;
	nft_address: string;
	list_state: string;
	currency_symbol: string;
	receipt?: string;
	purchase_receipt?: string;
	created_at: Date;
	cancelled_at?: Date;
}


export class ActiveListingsResultDto {
	network: string;
	marketplace_address: string;
	seller_address: string;
	price: number;
	nft_address: string;
	list_state: string;
	currency_symbol: string;
	receipt?: string;
	created_at: Date;
}

export type PurchasesDto = {
	network: string;
	marketplace_address: string;
	seller_address: string;
	price: number;
	nft_address: string;
	buyer_address?: string;
	purchase_receipt?: string;
	created_at: Date;
	purchased_at?: Date;
};

export type SellerListingsDto = ListingInfoResponseDto & {
	buyer_address?: string;
	purchased_at?: Date;
}