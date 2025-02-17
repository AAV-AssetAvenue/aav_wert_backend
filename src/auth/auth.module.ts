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

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AcessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
