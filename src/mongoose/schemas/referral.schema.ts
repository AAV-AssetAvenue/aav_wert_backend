import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";

export type ReferralDocument = HydratedDocument<Referral>;


@Schema({
  timestamps: true,
})
export class Referral {

  @Prop({

    required: true,
    type: String,
  })  
  referralCode: string;
  @Prop({
    type: Number,
    required: true,
  })
  aavAmount: number;

  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  txHash: string;

}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
ReferralSchema.plugin(mongoosePaginate);
