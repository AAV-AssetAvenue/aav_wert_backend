import { z } from "zod";

export const ReferralSchema = z.object({
  referralCode: z.string(),
  aavAmount: z.number(),
});

export type ReferralDTO = z.infer<typeof ReferralSchema>;
