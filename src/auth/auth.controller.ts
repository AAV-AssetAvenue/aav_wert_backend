import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "../zode.validation.pipe";
import {
  RefreshTokenDto,
  RefreshTokenSchema,
  SignupDto,
  SignupSchema,
} from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { Request as ERequest, Request, Response } from "express";
import { Roles } from "src/decorators/roles.decorator";
import { UserRoles } from "src/mongoose/schemas/user.schema";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { RolesGuard } from "./guards/roles.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("user")
  @UsePipes(new ZodValidationPipe(SignupSchema))
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post("refreshToken")
  @UsePipes(new ZodValidationPipe(RefreshTokenSchema))
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body);
  }

  @Get("me/:walletAddress")
  findme(@Param("walletAddress") walletAddress: string) {
    return this.authService.findMe(walletAddress);
  }
}
