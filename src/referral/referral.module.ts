import { Module } from "@nestjs/common";
import { ReferralService } from "./referral.service";
import { ReferralController } from "./referral.controller";
import { Referral, ReferralSchema } from "../mongoose/schemas/referral.schema";
import { CryptoOrder,CryptoOrderSchema } from "../mongoose/schemas/cryptoOrder.schema";
import { User, UserSchema } from "../mongoose/schemas/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { AAVVested, AAVVestedSchema } from "src/mongoose/schemas/AAVVested.schema";
import { Commission, CommissionSchema } from "src/mongoose/schemas/commission.schema";
import { Order, OrderSchema } from "src/mongoose/schemas/order.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
      { name: CryptoOrder.name, schema: CryptoOrderSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Commission.name, schema: CommissionSchema },
      { name: AAVVested.name, schema: AAVVestedSchema },
    ]),
    AuthModule,
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
})
export class ReferralModule {}
