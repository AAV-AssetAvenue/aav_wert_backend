import { z } from "zod";

export const CreateOrderSchema = z.object({
  wertOrderId: z.string(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
