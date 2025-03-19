import { z } from "zod";

export const ReferralSchema = z.object({
  referralCode: z.string(),
  txHash: z.string(),
  aavAmount: z.number(),
  solAmount: z.number(),
  usdAmount: z.number(),
  address: z.string(),
});

export type ReferralDTO = z.infer<typeof ReferralSchema>;
