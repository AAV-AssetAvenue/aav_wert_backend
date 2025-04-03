import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CommissionsService } from './commissions.service';
import { UserRoles } from 'src/mongoose/schemas/user.schema';
import { Roles } from 'src/decorators/roles.decorator';
import { Request } from "express";

@Controller('commissions')
export class CommissionsController {
  
      constructor(private readonly commissionService: CommissionsService) {}
          
        @Get(":address")
        // @UseGuards(JwtAuthGuard)
        async getCommissionData(@Param("address") address: string) {
          return await this.commissionService.getCommissionData(address);
        }
        @Get("aav/vestings")
        @UseGuards(JwtAuthGuard)
        @Roles(UserRoles.USER)
        async getVestedAAV(@Req() req: Request) {
          
          return await this.commissionService.getVestedAAV(req.user);
        }




      
    
    }
