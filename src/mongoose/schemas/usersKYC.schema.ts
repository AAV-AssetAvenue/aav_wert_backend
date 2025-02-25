import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";
import { User } from "./user.schema";

export type UsersKYCDocument = HydratedDocument<UsersKYC>;

@Schema({
  timestamps: true,
})
export class UsersKYC {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  user: User;

  @Prop({
    type: String,
    required: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  idType: string;
  @Prop({
    type: String,
    required: true,
  })
  idNumber: string;
  @Prop({
    type: String,
    required: true,
  })
  bank: string;
  @Prop({
    type: String,
    required: true,
  })
  bankAccount: string;

  @Prop({
    type: Number,
  })
  kycStep: number; // 1,2,3

  
}

export const UsersKYCSchema = SchemaFactory.createForClass(UsersKYC);
UsersKYCSchema.plugin(mongoosePaginate);
