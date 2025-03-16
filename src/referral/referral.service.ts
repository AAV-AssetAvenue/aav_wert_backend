import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { ReferralDTO } from "./dto";
import { Referral, ReferralDocument } from "src/mongoose/schemas/referral.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
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

}

async getSales(referralCode:string){
  const record = await this.referralModel.find({ referralCode:referralCode });
  return record;

}
}