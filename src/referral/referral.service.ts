import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { ReferralDTO } from "./dto";
import { Referral, ReferralDocument } from "src/mongoose/schemas/referral.schema";
import { CryptoOrder, CryptoOrderDocument } from "src/mongoose/schemas/cryptoOrder.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User,UserDocument } from "src/mongoose/schemas/user.schema";
import { Commission,CommissionDocument } from "src/mongoose/schemas/commission.schema";

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    @InjectModel(CryptoOrder.name) private cryptoOrderModel: Model<CryptoOrderDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(Commission.name) private commissionModel: Model<CommissionDocument>,
    
  ) {}

  // Create KYC record
  async createReferral(referralDto:ReferralDTO){
    const existingTxHash = await this.referralModel.findOne({ txHash: referralDto.txHash });
    if(existingTxHash){
      throw new BadRequestException('can not use same Transaction hash again')
    }

     await this.referralModel.create({
      referralCode: referralDto.referralCode,
      aavAmount: referralDto.aavAmount,
      txHash: referralDto.txHash,
      solAmount: referralDto.solAmount,
      usdAmount: referralDto.usdAmount,
      address: referralDto.address
    });
    

    const userRecord = await this.UserModel.findOne({ referralCode:referralDto.referralCode });
    const refereeRecord = await this.UserModel.findOne({ walletAddress:referralDto.address });
    if(refereeRecord?.referralCode === referralDto.referralCode){
      throw new BadRequestException('can not referral your self')
    }
    let commissionData = await this.commissionModel.findOne({ referralCode:referralDto.referralCode });
if(!commissionData){
  commissionData = await this.commissionModel.create({
      user:userRecord,
      referralCode: referralDto.referralCode,
      totalEarnedUSDC: referralDto.usdAmount*5/100,
      totalClaimedUSDC: 0,
      totalClaimableUSDC: 0,
      totalEarnedSOL: referralDto.solAmount*5/100,
      totalClaimedSOL: 0,
      totalClaimableSOL: 0,
      totalEarnedAAV: 20,
      totalClaimedAAV: 0,
      totalClaimableAAV:0 ,
      eligible300Bonus:false,
      address: userRecord.walletAddress
    });
    return
  }
    
  if(!commissionData.eligible300Bonus){
  const record = await this.cryptoOrderModel
    .findOne({ address: userRecord.walletAddress }) // Find by wallet address
    .sort({ createdAt: 1 }) // Sort by createdAt (oldest first)
    .exec();
    
    if(referralDto.aavAmount >= record.aavAmount){
      commissionData.eligible300Bonus = true
      commissionData.totalEarnedAAV += record.aavAmount * 3

      await commissionData.save();
    }
  }

  const record = await this.referralModel.find({ referralCode:referralDto.referralCode });
  if(record.length > 5){
    // 5th-10th,  30 AAV +6% Commission
    commissionData.totalEarnedAAV += 30;
    commissionData.totalEarnedSOL += referralDto.solAmount*6/100;
    commissionData.totalEarnedUSDC += referralDto.usdAmount*6/100;

  }else if(record.length > 10){
    commissionData.totalEarnedAAV += 40;
    commissionData.totalEarnedSOL += referralDto.solAmount*7/100;
    commissionData.totalEarnedUSDC += referralDto.usdAmount*7/100;

  }
  else if(record.length > 20){
    commissionData.totalEarnedAAV += 50;
    commissionData.totalEarnedSOL += referralDto.solAmount*10/100;
    commissionData.totalEarnedUSDC += referralDto.usdAmount*10/100;
 
  }else{
    commissionData.totalEarnedAAV += 20;
    commissionData.totalEarnedSOL += referralDto.solAmount*5/100;
    commissionData.totalEarnedUSDC += referralDto.usdAmount*5/100;
 
  }
  

}

async getSales(referralCode:string){
  const record = await this.referralModel.find({ referralCode:referralCode });
  return record;

}

}