import z from 'zod';

export const refreshTokenZodSchema = z.object({
  refreshToken: z.string(),
});

export const deleteUserZodSchema = z.object({
  id: z.string('user id is required'),
});
