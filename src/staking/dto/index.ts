import { z } from "zod";

export const StakingSchema = z.object({
  txHash: z.string(),
  stakeAmount: z.string(),
});

export type StakingDTO = z.infer<typeof StakingSchema>;
