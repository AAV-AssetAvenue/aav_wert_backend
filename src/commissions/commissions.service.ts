import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from 'src/auth/dto';
import { AAVVested, AAVVestedDocument } from 'src/mongoose/schemas/AAVVested.schema';
import { Commission, CommissionDocument } from 'src/mongoose/schemas/commission.schema';

@Injectable()
export class CommissionsService {

  constructor(
    @InjectModel(Commission.name) private commissionModel: Model<CommissionDocument>,
    @InjectModel(AAVVested.name) private aavVestedModel: Model<AAVVestedDocument>,
    
  ) {}

    async getCommissionData(address:string){
        const record = await this.commissionModel.findOne({ address:address });
        return record;
      }
      async getVestedAAV(user: UserDto){
        console.log("user.walletAddress -----------",user.walletAddress)
        const record = await this.aavVestedModel.find({ address:user.walletAddress.toString()  });
        return record;
      }

   
    
}
