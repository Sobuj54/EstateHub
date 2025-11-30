import z from 'zod';

export const refreshTokenZodSchema = z.object({
  refreshToken: z.string(),
});
