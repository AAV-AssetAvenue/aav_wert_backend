import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { ReferralDTO } from "./dto";
import { Referral, ReferralDocument } from "src/mongoose/schemas/referral.schema";
import { CryptoOrder, CryptoOrderDocument } from "src/mongoose/schemas/cryptoOrder.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "src/mongoose/schemas/user.schema";
import { Commission, CommissionDocument } from "src/mongoose/schemas/commission.schema";
import { AAVVested, AAVVestedDocument } from "src/mongoose/schemas/AAVVested.schema";
import { Order, OrderDocument } from "src/mongoose/schemas/order.schema";

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    @InjectModel(CryptoOrder.name) private cryptoOrderModel: Model<CryptoOrderDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(Commission.name) private commissionModel: Model<CommissionDocument>,
    @InjectModel(AAVVested.name) private aAVVestedModel: Model<AAVVestedDocument>,

  ) { }

  // Create KYC record
  async createReferral(referralDto: ReferralDTO) {
    const existingTxHash = await this.referralModel.findOne({ txHash: referralDto.txHash });
    if (existingTxHash) {
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


    const userRecord = await this.UserModel.findOne({ referralCode: referralDto.referralCode });
    const refereeRecord = await this.UserModel.findOne({ walletAddress: referralDto.address });
    if (refereeRecord?.referralCode === referralDto.referralCode) {
      throw new BadRequestException('can not referral your self')
    }
    let commissionData = await this.commissionModel.findOne({ referralCode: referralDto.referralCode });
    if (!commissionData) {
      commissionData = await this.commissionModel.create({
        user: userRecord,
        referralCode: referralDto.referralCode,
        totalEarnedUSDC: 0,
        totalClaimedUSDC: 0,
        totalEarnedSOL: 0,
        totalClaimedSOL: 0,
        totalEarnedAAV: 0,
        totalClaimedAAV: 0,
        eligible300Bonus: false,
        address: userRecord.walletAddress
      });
    }

    if (!commissionData.eligible300Bonus) {
      const record = await this.cryptoOrderModel
        .findOne({ address: userRecord.walletAddress }) // Find by wallet address
        .sort({ createdAt: 1 }) // Sort by createdAt (oldest first)
        .exec();
        const wertRecord = await this.orderModel
        .findOne({ user: userRecord._id }) // Find by wallet address
        .sort({ createdAt: 1 }) // Sort by createdAt (oldest first)
        .exec();

      if ((referralDto.aavAmount >= record.aavAmount) || (referralDto.aavAmount >= wertRecord.aavTransferAmount)) {
        commissionData.eligible300Bonus = true
        commissionData.totalEarnedAAV += record.aavAmount * 3
        await commissionData.save();

        const currentDate = new Date();
        const vestingEndDate = new Date();
        vestingEndDate.setMonth(currentDate.getMonth() + 24);
        await this.aAVVestedModel.create({
          referralCode: referralDto.referralCode,
          AAVamount: record.aavAmount * 3, // 300% bonus
          address: userRecord.walletAddress,
          vestingPeriod: vestingEndDate.getTime()
        })

      }
    }

    const record = await this.referralModel.find({ referralCode: referralDto.referralCode });
    if (record.length > 5) {
      // 5th-10th,  30 AAV +6% Commission
      const currentDate = new Date();
      const vestingEndDate = new Date();
      vestingEndDate.setMonth(currentDate.getMonth() + 24);
      await this.aAVVestedModel.create({
        referralCode: referralDto.referralCode,
        AAVamount: 30,
        address: userRecord.walletAddress,
        vestingPeriod: vestingEndDate.getTime()
      })
      commissionData.totalEarnedAAV += 30

      commissionData.totalEarnedSOL += referralDto.solAmount * 6 / 100;
      commissionData.totalEarnedUSDC += referralDto.usdAmount * 6 / 100;
      await commissionData.save()
    } else if (record.length > 10) {
      // 10th-20th, ⁠40 AAV +7% Commission

      const currentDate = new Date();
      const vestingEndDate = new Date();
      vestingEndDate.setMonth(currentDate.getMonth() + 24);
      await this.aAVVestedModel.create({
        referralCode: referralDto.referralCode,
        AAVamount: 40,
        address: userRecord.walletAddress,
        vestingPeriod: vestingEndDate.getTime()
      })
      commissionData.totalEarnedAAV += 40
      commissionData.totalEarnedSOL += referralDto.solAmount * 7 / 100;
      commissionData.totalEarnedUSDC += referralDto.usdAmount * 7 / 100;
      await commissionData.save()
    }
    else if (record.length > 20) {
      //20th- ⁠50th, 50 AAV +10% Commission

      const currentDate = new Date();
      const vestingEndDate = new Date();
      vestingEndDate.setMonth(currentDate.getMonth() + 24);
      await this.aAVVestedModel.create({
        referralCode: referralDto.referralCode,
        AAVamount: 50,
        address: userRecord.walletAddress,
        vestingPeriod: vestingEndDate.getTime()
      })
      commissionData.totalEarnedAAV += 50
      commissionData.totalEarnedSOL += referralDto.solAmount * 10 / 100;
      commissionData.totalEarnedUSDC += referralDto.usdAmount * 10 / 100;
      await commissionData.save()
    } else {
      //1st-5th purchase, ⁠20 AAV +5% Commission 
      const currentDate = new Date();
      const vestingEndDate = new Date();
      vestingEndDate.setMonth(currentDate.getMonth() + 24);
      await this.aAVVestedModel.create({
        referralCode: referralDto.referralCode,
        AAVamount: 20,
        address: userRecord.walletAddress,
        vestingPeriod: vestingEndDate.getTime()
      })
      commissionData.totalEarnedAAV += 20
      commissionData.totalEarnedSOL += referralDto.solAmount * 5 / 100;
      commissionData.totalEarnedUSDC += referralDto.usdAmount * 5 / 100;
      await commissionData.save()
    }
    return commissionData;

  }

  async getSales(referralCode: string) {
    const record = await this.referralModel.find({ referralCode: referralCode });
    return record;

  }
  async getClaimable(address: string){
    const currentTime = Date.now();
    const records = await this.aAVVestedModel.find({ address });
  
    let totalUnlocked = 0;
  
    for (const record of records) {
      const { AAVamount, vestingPeriod, createdAt } = record;
    
      if (!createdAt || !vestingPeriod) continue;
    
      const startTime = new Date(createdAt).getTime();
      const endTime = Number(vestingPeriod); // timestamp when vesting ends
      const totalVestingDuration = endTime - startTime;
    
      const totalVestingMonths = Math.ceil(totalVestingDuration / (30 * 24 * 60 * 60 * 1000)); // approx per month
      const monthlyUnlock = AAVamount / totalVestingMonths;
    
      const now = new Date();
      const created = new Date(createdAt);
    
      const fullMonthsElapsed =
        (now.getFullYear() - created.getFullYear()) * 12 +
        (now.getMonth() - created.getMonth());
    
      const effectiveMonths = Math.min(fullMonthsElapsed, totalVestingMonths);
    
      if (effectiveMonths <= 0) continue;
    
      const unlocked = effectiveMonths * monthlyUnlock;
    
      totalUnlocked += unlocked;
    }
  
   const commissionRecord = await this.commissionModel.findOne({ address });

   const totalClaimed = commissionRecord?.totalClaimedAAV || 0;
 
   const claimableNow = Math.max(totalUnlocked - totalClaimed, 0);
 
   return claimableNow;
  }

}