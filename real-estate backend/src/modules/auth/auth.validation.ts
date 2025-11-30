import z from 'zod';
import { passwordRegex, roles } from './auth.constants';

export const registerZodSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.email('Invalid email address').max(254),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
      passwordRegex,
      'Password must include at least one uppercase letter, one number and one special character'
    ),
  role: z
    .enum(roles)
    .optional()
    .default('member')
    // Prevent signup with privileged roles unless special flow
    .refine((r) => r !== 'super_admin', {
      message: 'Cannot register as super_admin or admin',
    }),
});

export const loginZodSchema = z.object({
  email: z.email('Invalid email address').max(254),
  password: z.string(),
  remember: z.boolean(),
});

export const refreshTokenZodSchema = z.object({
  refreshToken: z.string(),
});

export const resetPasswordZodSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
      passwordRegex,
      'Password must include at least one uppercase letter, one number and one special character'
    ),
});

export const forgotPasswordZodSchema = z.object({
  email: z.email(),
});
