import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CommissionsService } from './commissions.service';

@Controller('commissions')
export class CommissionsController {
  
      constructor(private readonly commissionService: CommissionsService) {}
    
  
    
        @Get(":referralCode")
        @UseGuards(JwtAuthGuard)
        async getCommissionData(@Param("referralCode") referralCode: string) {
          return await this.commissionService.getCommissionData(referralCode);
        }
      
    
    }
