import z from 'zod';

export const mailZodSchema = z.object({
  email: z.email(),
});
