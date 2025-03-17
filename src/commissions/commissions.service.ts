import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Commission, CommissionDocument } from 'src/mongoose/schemas/commission.schema';

@Injectable()
export class CommissionsService {

  constructor(
    @InjectModel(Commission.name) private commissionModel: Model<CommissionDocument>,
    
  ) {}

    async getCommissionData(referralCode:string){
        const record = await this.commissionModel.findOne({ referralCode:referralCode });
        return record;
      }
}
