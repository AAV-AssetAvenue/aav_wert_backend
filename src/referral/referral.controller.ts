import {
  Controller,
  Post,
  Get,
  Body,
  UsePipes,
  UseGuards,
  Param,
} from "@nestjs/common";
import { ReferralService } from "./referral.service";
import { ReferralDTO, ReferralSchema } from "./dto";
import { ZodValidationPipe } from "src/zode.validation.pipe";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";

@Controller("referral")
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(ReferralSchema))
  @UseGuards(JwtAuthGuard)
  create(@Body() referralDto: ReferralDTO) {
    return this.referralService.createReferral(referralDto);
  }

  @Get("claimableAAV/:address")
  // @UseGuards(JwtAuthGuard)
  async getClaimable(@Param("address") address: string) {
    return await this.referralService.getClaimable(address);
  }

  @Get(":referralCode")
  // @UseGuards(JwtAuthGuard)
  async getAllSales(@Param("referralCode") referralCode: string) {
    return await this.referralService.getSales(referralCode);
  }
}