import { Module } from "@nestjs/common";
import { StakingService } from "./staking.service";
import { StakingController } from "./staking.controller";
import { Staking, StakingSchema } from "../mongoose/schemas/staking.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Staking.name, schema: StakingSchema }]),
    AuthModule,
  ],
  controllers: [StakingController],
  providers: [StakingService],
})
export class StakingModule {}
