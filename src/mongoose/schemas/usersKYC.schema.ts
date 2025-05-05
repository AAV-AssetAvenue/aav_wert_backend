import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";
import { User } from "./user.schema";

export type UsersKYCDocument = HydratedDocument<UsersKYC>;
 enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
} 
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
  })
  bank: string;
  @Prop({
    type: String,
  })
  bankType: string;
  @Prop({
    type: String,
  })
  bankAccount: string;
  @Prop({
    type: String,
  })
  bic: string;
  @Prop({
    index: true,
    unique: true,
    trim: true,
  })
  walletAddress: string;
  @Prop({
    type: String,
    enum: [
      KycStatus.NOT_SUBMITTED,
      KycStatus.PENDING,
      KycStatus.APPROVED,
      KycStatus.REJECTED
    ],
    default: KycStatus.NOT_SUBMITTED,
  })
  kycStatus: string; 
  @Prop({
    type: String,
    required: true,
  })
  idDocumentUrl: String;
  @Prop({
    type: String,
    required: true,
  })
  selfieUrl: String
  
}

export const UsersKYCSchema = SchemaFactory.createForClass(UsersKYC);
UsersKYCSchema.plugin(mongoosePaginate);
