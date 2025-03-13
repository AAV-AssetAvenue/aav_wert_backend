import { z } from "zod";

export const CreateOrderSchema = z.object({
  wertOrderId: z.string(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;




export const CryptoOrderSchema = z.object({
  txHash: z.string(),
  aavAmount: z.number(),
  amount: z.string(),
  currency: z.string(),
});

export type CryptoOrderDTO = z.infer<typeof CryptoOrderSchema>;

