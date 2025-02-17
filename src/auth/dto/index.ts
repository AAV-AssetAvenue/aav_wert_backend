import { z } from "zod";

export const SignupSchema = z.object({
  walletAddress: z.string(),
});

export const UserTokenSchema = z.object({
  id: z.string(),
  walletAddress: z.string(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const UserSchema = z.object({
  id: z.string(),
  walletAddress: z.string(),
});

export type SignupDto = z.infer<typeof SignupSchema>;

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

export type UserTokenDto = z.infer<typeof UserTokenSchema>;

export type UserDto = z.infer<typeof UserSchema>;
