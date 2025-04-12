import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AcessTokenStrategy } from "./strategies/acess-token.strategy";
import { RefreshTokenStrategy } from "./strategies/refresh-token.strategy";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/mongoose/schemas/user.schema";
import { HttpModule } from "@nestjs/axios";
import { Commission, CommissionSchema } from "src/mongoose/schemas/commission.schema";
import { AAVVested, AAVVestedSchema } from "src/mongoose/schemas/AAVVested.schema";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Commission.name, schema: CommissionSchema },
            { name: AAVVested.name, schema: AAVVestedSchema },
      
    ]),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AcessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
