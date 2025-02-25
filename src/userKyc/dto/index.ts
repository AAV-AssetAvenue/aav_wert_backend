import { z } from "zod";

export const UserKycSchema = z.object({
    email: z.string(),
    name: z.string(),
 
    idType: z.string(),

    idNumber: z.string(),
 
    bank: z.string(),
 
    bankAccount: z.string(),
    walletAddress: z.string(),
});

export type UserKycDTO = z.infer<typeof UserKycSchema>;
