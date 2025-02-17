import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";
import { User } from "./user.schema";

export type OrderDocument = HydratedDocument<Order>;

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export enum AavTransferStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  user: User;

  @Prop({
    type: String,
    enum: [
      PaymentStatus.PENDING,
      PaymentStatus.COMPLETED,
      PaymentStatus.CANCELLED,
      PaymentStatus.FAILED,
    ],
    default: PaymentStatus.PENDING,
  })
  paymentStatus: string;

  @Prop({
    type: String,
    default: null,
  })
  paymentErrorMessage: string;

  @Prop({
    type: String,
    unique: true,
    index: true,
  })
  wertOrderId: string;

  @Prop({
    type: String,
  })
  usdtAmount: string;

  @Prop({
    type: String,
  })
  aavTransferedTo: string;

  @Prop({
    type: String,
    enum: [
      AavTransferStatus.PENDING,
      AavTransferStatus.COMPLETED,
      AavTransferStatus.CANCELLED,
      AavTransferStatus.FAILED,
    ],
    default: AavTransferStatus.PENDING,
  })
  aavTransferStatus: string;

  @Prop({
    type: String,
  })
  aavTransferHash: string;

  @Prop({
    type: String,
  })
  aavTransferAmount: number;

  @Prop({
    type: String,
  })
  aavTransferFee: number;

  @Prop({
    type: String,
  })
  aavTransferErrorMessage: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.plugin(mongoosePaginate);
