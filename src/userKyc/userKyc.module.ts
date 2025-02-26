import { Module } from "@nestjs/common";
import { UserKycService } from "./userKyc.service";
import { UserKycController } from "./userKyc.controller";
import { UsersKYC, UsersKYCSchema } from "../mongoose/schemas/usersKYC.schema";
import { User, UserSchema } from "../mongoose/schemas/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UsersKYC.name, schema: UsersKYCSchema },{name: User.name, schema: UserSchema }]),
    AuthModule,
  ],
  controllers: [UserKycController],
  providers: [UserKycService],
})
export class UserKycModule {}
