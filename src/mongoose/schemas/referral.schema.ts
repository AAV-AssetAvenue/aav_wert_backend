import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";

export type ReferralDocument = HydratedDocument<Referral>;


@Schema({
  timestamps: true,
})
export class Referral {

  @Prop({
    index: true,
    unique: true,
    trim: true,
  })  
  referralCode: string;
  @Prop({
    type: Number,
  })
  aavAmount: number;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
ReferralSchema.plugin(mongoosePaginate);
