import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RefreshTokenDto, SignupDto } from "./dto";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "./jwt-constants";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/mongoose/schemas/user.schema";
import { Document, Model, Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import { Commission, CommissionDocument } from "src/mongoose/schemas/commission.schema";
import { AAVVested, AAVVestedDocument } from "src/mongoose/schemas/AAVVested.schema";
import { PublicKey } from "@solana/web3.js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import * as nacl from 'tweetnacl';
@Injectable({})
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Commission.name) private commissionModel: Model<CommissionDocument>,
    @InjectModel(AAVVested.name) private aAVVestedModel: Model<AAVVestedDocument>,
    
    private jwtService: JwtService
  ) {}
  async signup(payload: SignupDto) {
    try {
      const existingUser = await this.findOne({
        walletAddress: payload.walletAddress,
      });
      if (existingUser) {
      const isVerified = this.verifySignature(existingUser.nonce, payload.signature, payload.walletAddress);
      if(!isVerified){
        throw new HttpException("Signature verification failed", HttpStatus.BAD_REQUEST);
      }
    }else{
        const isVerified = this.verifySignature("Login request", payload.signature, payload.walletAddress);
      if(!isVerified){
        throw new HttpException("Signature verification failed", HttpStatus.BAD_REQUEST);
      }
    }
      const nonce = `Login request \n At : ${new Date().toISOString()} \n By : ${payload.walletAddress}`;

      let referralCode = uuidv4().split('-')[0].toUpperCase(); 
      const referralCodeUsed = await this.findOne({
        referralCode: referralCode,
      });
      if(referralCodeUsed){
        referralCode = uuidv4().split('-')[0].toUpperCase(); 
      }
      // If user exist, 
      if (existingUser) {
        existingUser.nonce = nonce;
        // check if the user has already a referral code
        // if the user has a referral code, do not update it
        if(!existingUser?.referralCode){
          existingUser.referralCode = referralCode;
        }
        await existingUser.save()
        // check if the user has already a commission data
        // if the user has a commission data, do not create it again
        let commissionData = await this.commissionModel.findOne({ user:existingUser._id});
        if (!commissionData) {
          const totalAAV = await this.aAVVestedModel.aggregate([
            {
              $match: {
                address: payload.walletAddress,
              }
            },
            {
              $group: {
                _id: null,
                totalAAV: { $sum: "$AAVamount" }
              }
            }
          ])
          await this.commissionModel.create({
            user: existingUser._id,
            totalEarnedUSDC: 0,
            totalClaimedUSDC: 0,
            totalEarnedSOL: 0,
            totalClaimedSOL: 0,
            totalEarnedAAV: totalAAV[0]?.totalAAV || 0,
            totalClaimedAAV: 0,
            eligible300Bonus: false,
            address: payload.walletAddress
          });
        }


        const tokens = this.generateJwtTokens(existingUser);
        return {
          ...tokens,
        };
      }

      // else user did not exist, create new user
      const user = await this.create({
        walletAddress: payload.walletAddress,
        referralCode:referralCode,
        nonce
      });
        const totalAAV = await this.aAVVestedModel.aggregate([
          {
            $match: {
              address: payload.walletAddress,
            }
          },
          {
            $group: {
              _id: null,
              totalAAV: { $sum: "$AAVamount" }
            }
          }
        ])
        await this.commissionModel.create({
          user: user._id,
          totalEarnedUSDC: 0,
          totalClaimedUSDC: 0,
          totalEarnedSOL: 0,
          totalClaimedSOL: 0,
          totalEarnedAAV: totalAAV[0]?.totalAAV || 0,
          totalClaimedAAV: 0,
          eligible300Bonus: false,
          address: payload.walletAddress
        });
        
      const tokens = this.generateJwtTokens(user);

      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return {
        ...tokens,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async refreshToken(payload: RefreshTokenDto) {
    try {
      const user = this.jwtService.verify(payload.refreshToken, {
        secret: jwtConstants.refreshSecret,
      });

      if (!user) {
        throw new HttpException("invalid refresh token", HttpStatus.FORBIDDEN);
      }

      const validRefreshToken = await this.UserModel.findOne({
        _id: user.id,
        refreshToken: payload.refreshToken,
      });

      if (!validRefreshToken) {
        throw new HttpException("invalid refresh token", HttpStatus.FORBIDDEN);
      }

      const tokens = this.generateJwtTokens(user);

      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return tokens;
    } catch (error) {
      if (error.message === "jwt malformed") {
        throw new HttpException("invalid refresh token", HttpStatus.FORBIDDEN);
      }

      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    return await this.UserModel.updateOne(
      {
        _id: userId,
      },
      {
        refreshToken,
      }
    );
  }

  private generateJwtTokens(
    payload: Document<unknown, {}, User> &
      User & {
        _id: Types.ObjectId;
      }
  ) {
    const { id, walletAddress,referralCode } = payload;
    const access_token = this.jwtService.sign(
      {
        id,
        walletAddress,
      },
      {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.expiresIn,
      }
    );

    const refresh_token = this.jwtService.sign(
      {
        id,
        walletAddress,
      },
      {
        secret: jwtConstants.refreshSecret,
        expiresIn: jwtConstants.refreshTokenExpiresIn,
      }
    );

    return {
      access_token,
      refresh_token,
      referralCode
      
    };
  }

  async findOne(payload: any) {
    return await this.UserModel.findOne(payload);
  }

  async findMe(publicKey:string) {
    try {
      const user = await this.UserModel.findOne({walletAddress:publicKey});

      if (!user) {
        throw new HttpException("user not found", HttpStatus.FORBIDDEN);
      }

      return {
        user
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async create(payload: any) {
    return await this.UserModel.create(payload);
  }

  verifySignature (message:string, signature:string, publicKey:string):boolean {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const pubKeyBytes = new PublicKey(publicKey).toBytes();
          console.log("here i am")

    return nacl.sign.detached.verify(messageBytes, signatureBytes, pubKeyBytes);
  };


}
