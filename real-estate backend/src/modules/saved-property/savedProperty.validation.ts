import z from 'zod';

export const savedPropertyZodSchema = z.object({
  propertyId: z.string('Property id is required.'),
  userId: z.string('user id is required.'),
});
