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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from "@nestjs/common";
import { UserKycService } from "./userKyc.service";
import { UserKycDTO, UserKycSchema, UserUpdateKycDTO, UserUpdateKycSchema } from "./dto";
import { ZodValidationPipe } from "src/zode.validation.pipe";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { FilesInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/config/multer-config";
import { getSignedS3Url } from "src/helpers/getSignedS3Url";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UserRoles } from "src/mongoose/schemas/user.schema";
import { Roles } from "src/decorators/roles.decorator";
import { KycStatusType } from "src/mongoose/schemas/usersKYC.schema";

@Controller("userKyc")
export class UserKycController {
  constructor(private readonly userKycService: UserKycService) { }


  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("files", 2, multerOptions)) // Accept 2 files: ID + Selfie
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: UserKycDTO
  ) {
    if (!files || files.length < 2) {
      throw new BadRequestException("Both ID document and Selfie are required.");
    }
    const uploadedFiles = files as unknown as { location: string }[];
    return await this.userKycService.createKYC(data, {
      idDocumentUrl: uploadedFiles[0].location, // S3 URL for ID Document
      selfieUrl: uploadedFiles[1].location, // S3 URL for Selfie
    });
  }



  // Get all KYC records 
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async findAll(@Query("page") page?: number, @Query("limit") limit?: number) {
    return await this.userKycService.getAllKYC(page, limit);
  }
  // Get all users project name and email
  @Get("/users")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUsers(@Query("page") page?: number, @Query("limit") limit?: number) {
    return await this.userKycService.getUsers(page, limit);
  }

  // Get KYC record by ID
  @Get(":walletAddress")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async findOne(@Param("walletAddress") walletAddress: string) {
    return await this.userKycService.getKYCById(walletAddress);
  }

  @Get('files/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async getSignedUrl(@Param('key') key: string) {
      const decodedKey = decodeURIComponent(key);

    const url = await getSignedS3Url(`uploads/${decodedKey}`);
    return { url };
  }

  // user Update KYC record by ID
  @Patch(":walletAddress")
  @UseGuards(JwtAuthGuard)
  // @UsePipes(new ZodValidationPipe(UserUpdateKycSchema.partial()))
  async update(@Param("walletAddress") walletAddress: string, @Body() data: Partial<UserUpdateKycDTO>) {
    return await this.userKycService.updateKYC(walletAddress, data);
  }

  // Delete KYC record by ID
  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async remove(@Param("id") id: string) {
    return await this.userKycService.deleteKYC(id);
  }


   // admin Update KYC status
  @Patch("updateStatus/:walletAddress")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  async update_kyc_status(@Param("walletAddress") walletAddress: string, @Body() data:{kycStatus:KycStatusType}) {
    return await this.userKycService.updateKYCStatus(walletAddress, data.kycStatus);
  }

}