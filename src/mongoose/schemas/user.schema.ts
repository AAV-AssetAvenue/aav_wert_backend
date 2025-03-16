import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";

export type UserDocument = HydratedDocument<User>;

export enum UserRoles {
  ADMIN = "admin",
  USER = "user",
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    index: true,
    unique: true,
    trim: true,
  })
  walletAddress: string;

  @Prop()
  refreshToken: string;

  @Prop({
    type: String,
    enum: [UserRoles.ADMIN, UserRoles.USER],
    default: UserRoles.USER,
  })
  role: string;
  
  @Prop({
    type: String,
    unique: true,

  })  
  referralCode: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(mongoosePaginate);
