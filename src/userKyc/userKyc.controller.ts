import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { UserKycService } from "./userKyc.service";
import { UserKycDTO, UserKycSchema } from "./dto";
import { ZodValidationPipe } from "src/zode.validation.pipe";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";

@Controller("userKyc")
export class UserKycController {
  constructor(private readonly userKycService: UserKycService) {}

  // Create KYC record
  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(UserKycSchema))
  async create(@Body() data: UserKycDTO) {
    return await this.userKycService.createKYC(data);
  }

  // Get all KYC records 
  @Get()
  // @UseGuards(JwtAuthGuard)
  async findAll(@Query("page") page?: number, @Query("limit") limit?: number) {
    return await this.userKycService.getAllKYC(page, limit);
  }

  // Get KYC record by ID
  @Get(":id")
  // @UseGuards(JwtAuthGuard)
  async findOne(@Param("id") id: string) {
    return await this.userKycService.getKYCById(id);
  }

  // Update KYC record by ID
  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(UserKycSchema.partial()))
  async update(@Param("id") id: string, @Body() data: Partial<UserKycDTO>) {
    return await this.userKycService.updateKYC(id, data);
  }

  // Delete KYC record by ID
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async remove(@Param("id") id: string) {
    return await this.userKycService.deleteKYC(id);
  }
}