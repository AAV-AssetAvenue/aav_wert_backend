import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";

export type AAVVestedDocument = HydratedDocument<AAVVested>;



@Schema({
  timestamps: true,
})
export class AAVVested {

    @Prop({
        type: String,
    
      })  
      referralCode: string;



  @Prop({
    type: Number,
  })
  AAVamount: number;


  @Prop({
    type: Number,
  })
  vestingPeriod: number;

 
  
  @Prop({
    type: String,
  })
  address: string;


  @Prop({
    type: Boolean,
    default: false,
  })
  claimed: boolean;

  

}

export const AAVVestedSchema = SchemaFactory.createForClass(AAVVested);
AAVVestedSchema.plugin(mongoosePaginate);
