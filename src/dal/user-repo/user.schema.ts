import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  api_key: string;

  @Prop({ required: false })
  white_listed_domains: string[];

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  team_size: string;

  @Prop({ required: false })
  project_name: string;

  @Prop({ required: false })
  project_info: string;

  id: ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
