import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { StakingDTO } from "./dto";
import { Staking } from "src/mongoose/schemas/staking.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { UserDto } from "src/auth/dto";

@Injectable()
export class StakingService {
  constructor(
    @InjectModel(Staking.name) private stakingModel: Model<Staking>
  ) {}

  async create(user: UserDto, createStakingDto: StakingDTO) {
    try {
      const staking = await this.stakingModel.create({
        ...createStakingDto,
        user: user.id,
        stakedBy: user.walletAddress,
      });
      return staking;
    } catch (error) {
      throw new HttpException(
        error?.message || "Internal server error",
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll(user: UserDto, page: number = 1, limit: number = 10) {
    const stakings = await this.stakingModel
      .find({ user: user.id })
      .populate("user", "_id walletAddress")
      .sort({ createdAt: -1 });
    return stakings;
  }

  async findOne(user: UserDto, id: string) {
    const staking = await this.stakingModel
      .findOne({
        _id: id,
        user: user.id,
      })
      .populate("user", "_id walletAddress");
    if (!staking) {
      throw new HttpException("Staking tx not found", HttpStatus.BAD_REQUEST);
    }
    return staking;
  }
}
