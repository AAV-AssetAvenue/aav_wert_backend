import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";
import { User } from "./user.schema";

export type StakingDocument = HydratedDocument<Staking>;

@Schema({
  timestamps: true,
})
export class Staking {
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
  txHash: string;

  @Prop({
    type: String,
    required: true,
  })
  stakeAmount: string;

  @Prop({
    type: String,
    required: true,
  })
  stakedBy: string;
}

export const StakingSchema = SchemaFactory.createForClass(Staking);
StakingSchema.plugin(mongoosePaginate);
