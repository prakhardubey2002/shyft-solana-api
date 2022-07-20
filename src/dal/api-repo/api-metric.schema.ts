import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApiMetricDocument = ApiMetric & Document;

@Schema({ timestamps: { createdAt: "created_at" } })
export class ApiMetric {
	@Prop({ required: true })
	api_key: string;

	@Prop({ required: true })
	endpoint: string;
}

export const ApiMetricSchema = SchemaFactory.createForClass(ApiMetric);