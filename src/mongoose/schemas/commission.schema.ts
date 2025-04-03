import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";
import { User } from "./user.schema";

export type CommissionDocument = HydratedDocument<Commission>;



@Schema({
  timestamps: true,
})
export class Commission {

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  user: User;
  @Prop({
    type: Boolean,
    default: false,

  })  
  eligible300Bonus: boolean;


  @Prop({
    type: Number,
  })
  totalEarnedAAV: number;

  @Prop({
    type: Number,
  })
  totalClaimedAAV: number;




  @Prop({
    type: Number,
  })
  totalEarnedSOL: number;

  @Prop({
    type: Number,
  })
  totalClaimedSOL: number;





  @Prop({
    type: Number,
  })
  totalEarnedUSDC: number;

  @Prop({
    type: Number,
  })
  totalClaimedUSDC: number;

  
  @Prop({
    type: String,
  })
  address: number;

  

}

export const CommissionSchema = SchemaFactory.createForClass(Commission);
CommissionSchema.plugin(mongoosePaginate);
