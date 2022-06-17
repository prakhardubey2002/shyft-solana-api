/*
1. schema for the nft document
2. functions to read, write and update these documents. These functions will be called from the service layers
*/
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NftInfoDocument = NftInfo & Document

interface creator {
    address: string
    verified: boolean
    share: number
}

@Schema()
export class NftInfo {
    @Prop({ required: true })
    chain: string

    @Prop({ required: true })
    updateAuthority: string

    @Prop({ required: true })
    mint: string

    @Prop({ required: true })
    primarySaleHappened: Boolean

    @Prop({ required: true })
    isMutable: Boolean

    @Prop({ required: true })
    name: string

    @Prop({ required: true })
    symbol: string

    @Prop({ required: true })
    description: string

    @Prop({ required: false })
    externalUrl: string

    @Prop({ required: false })
    sellerFeeBasisPoints: number

    @Prop({ required: true })
    assetUri: string

    @Prop({ required: true })
    metadataUri: string

    @Prop({ required: false, type: Object })
    attributes: Object

    @Prop({ required: true })
    creators: creator[]
}

export const NftInfoSchema = SchemaFactory.createForClass(NftInfo);
