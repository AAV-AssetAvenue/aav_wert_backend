import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";
import { User } from "./user.schema";

export type CryptoOrderDocument = HydratedDocument<CryptoOrder>;



@Schema({
  timestamps: true,
})
export class CryptoOrder {

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  user: User;
  @Prop({
    type: String,
  })
  amount: string;

  @Prop({
    type: String,
  })
  txHash: string;
  @Prop({
    type: String,
  })
  currency: string;

  @Prop({
    type: String,
  })
  aavAmount: number;
  @Prop({
    type: String,
  })
  address: number;

}

export const CryptoOrderSchema = SchemaFactory.createForClass(CryptoOrder);
CryptoOrderSchema.plugin(mongoosePaginate);
