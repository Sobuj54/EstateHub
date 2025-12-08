import z from 'zod';

export const refreshTokenZodSchema = z.object({
  refreshToken: z.string(),
});

export const deleteUserZodSchema = z.object({
  id: z.string('user id is required'),
});

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),

  email: z
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters')
    .optional(),

  phone: z.string().optional(),

  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
});
