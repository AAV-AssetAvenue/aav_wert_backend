import { z } from "zod";

export const UserKycSchema = z.object({
    email: z.string(),
    name: z.string(),
 
    idType: z.string(),
    idNumber: z.string(),
 
    bank: z.string().optional(),
    bankAccount: z.string().optional(),
    bic: z.string().optional(),
    bankType: z.string().optional(),

    walletAddress: z.string(),
});

export type UserKycDTO = z.infer<typeof UserKycSchema>;



export const UserUpdateKycSchema = z.object({
    email: z.string(), 
    bank: z.string(),
    bankAccount: z.string(),

});

export type UserUpdateKycDTO = z.infer<typeof UserUpdateKycSchema>;
