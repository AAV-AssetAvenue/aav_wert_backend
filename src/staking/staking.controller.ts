import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import { StakingService } from "./staking.service";
import { StakingDTO, StakingSchema } from "./dto";
import { ZodValidationPipe } from "src/zode.validation.pipe";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { UserRoles } from "src/mongoose/schemas/user.schema";
import { Roles } from "src/decorators/roles.decorator";
import { Request } from "express";

@Controller("staking")
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @Post("create")
  @UsePipes(new ZodValidationPipe(StakingSchema))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  create(@Req() req: Request, @Body() createStakingDto: StakingDTO) {
    return this.stakingService.create(req.user, createStakingDto);
  }

  @Get("findAll")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  findAll(
    @Req() req: Request,
    @Query("page") page: number,
    @Query("limit") limit: number
  ) {
    return this.stakingService.findAll(req.user, page, limit);
  }

  @Get("findOne/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  findOne(@Req() req: Request, @Param("id") id: string) {
    return this.stakingService.findOne(req.user, id);
  }
}
