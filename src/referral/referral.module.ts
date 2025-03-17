import { Module } from "@nestjs/common";
import { ReferralService } from "./referral.service";
import { ReferralController } from "./referral.controller";
import { Referral, ReferralSchema } from "../mongoose/schemas/referral.schema";
import { CryptoOrder,CryptoOrderSchema } from "../mongoose/schemas/cryptoOrder.schema";
import { User, UserSchema } from "../mongoose/schemas/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
      { name: CryptoOrder.name, schema: CryptoOrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
})
export class ReferralModule {}
