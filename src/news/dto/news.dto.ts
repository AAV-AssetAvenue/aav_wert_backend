import { z } from "zod";

export const CreateNewsSchema = z.object({
  title: z.string(),
  content: z.string(),
  publishedBy: z.string(),
  date:z.string()
});

export type CreateNewsDto = z.infer<typeof CreateNewsSchema>;

