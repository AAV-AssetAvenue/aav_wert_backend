import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { UserKycDTO } from "./dto";
import { UsersKYC, UsersKYCDocument } from "src/mongoose/schemas/usersKYC.schema";
import { User, UserDocument } from "src/mongoose/schemas/user.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UserKycService {
  constructor(
    @InjectModel(UsersKYC.name) private userKycModel: Model<UsersKYCDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  // Create KYC record
  async createKYC(data: UserKycDTO): Promise<UsersKYC> {
    const existingRecord = await this.userKycModel.findOne({ email: data.email });

    if (existingRecord) {
      throw new BadRequestException("KYC record for this email already exists.");
    }
    const user = await this.userModel.findOne({ walletAddress: data.walletAddress });

    const newKyc = await this.userKycModel.create({
      user:user._id,
      walletAddress: user.walletAddress,
      email: data.email,
      name: data.name,
      idType: data.idType,
      idNumber: data.idNumber,
      bank: data.bank,
      bankAccount: data.bankAccount,
      kycStep: 1,
    });
    return newKyc
  }

  // Get all KYC records (with pagination)
  async getAllKYC(page: number = 1, limit: number = 10) {
    return await this.userKycModel.find({}, { page, limit });
  }

  // Get KYC record by ID
  async getKYCById(id: string): Promise<UsersKYC> {
    const record = await this.userKycModel.findById(id);
    if (!record) {
      throw new NotFoundException("KYC record not found.");
    }
    return record;
  }

  // Update KYC record by ID
  async updateKYC(id: string, data: Partial<UserKycDTO>): Promise<UsersKYC> {
    const updatedRecord = await this.userKycModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedRecord) {
      throw new NotFoundException("KYC record not found.");
    }
    return updatedRecord;
  }

  // Delete KYC record by ID
  async deleteKYC(id: string): Promise<{ message: string }> {
    const deletedRecord = await this.userKycModel.findByIdAndDelete(id);

    if (!deletedRecord) {
      throw new NotFoundException("KYC record not found.");
    }
    return { message: "KYC record deleted successfully." };
  }
}