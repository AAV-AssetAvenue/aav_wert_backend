import { config } from "dotenv";
config();

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "14d",
  refreshSecret: process.env.REFRESH_TOKEN_SECRET,
};
