import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RefreshTokenDto, SignupDto } from "./dto";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "./jwt-constants";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/mongoose/schemas/user.schema";
import { Document, Model, Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

@Injectable({})
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService
  ) {}
  async signup(payload: SignupDto) {
    try {
      const existingUser = await this.findOne({
        walletAddress: payload.walletAddress,
      });

      let referralCode = uuidv4().split('-')[0].toUpperCase(); 
      const referralCodeUsed = await this.findOne({
        referralCode: referralCode,
      });
      if(referralCodeUsed){
        referralCode = uuidv4().split('-')[0].toUpperCase(); 

      }
      if (existingUser) {
        if(!existingUser?.referralCode){
          existingUser.referralCode = referralCode;
        }
        await existingUser.save()
        const tokens = this.generateJwtTokens(existingUser);
        return {
          ...tokens,
        };
      }

      const user = await this.create({
        walletAddress: payload.walletAddress,
        referralCode:referralCode
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

  async findMe(payload: any) {
    try {
      const user = await this.UserModel.findById(payload.id);

      if (!user) {
        throw new HttpException("user not found", HttpStatus.FORBIDDEN);
      }

      return {
        id: user._id,
        walletAddress: user.walletAddress,
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
}
