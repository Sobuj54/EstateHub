import { z } from 'zod';

const CoordinatesZodSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const PropertyTypes = z.enum([
  'apartment',
  'house',
  'condo',
  'townhouse',
  'land',
  'commercial',
]);

export const PropertyZodSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters long'),
  price: z.number().min(0, 'Price cannot be negative'),
  address: z.string().trim().min(5, 'Address is required'),
  bedrooms: z.number().int().min(1, 'A property must have at least 1 bedroom'),
  bathrooms: z
    .number()
    .int()
    .min(1, 'A property must have at least 1 bathroom'),
  sqft: z.number().int().min(10, 'Square footage must be at least 10'),

  propertyType: PropertyTypes,

  coordinates: CoordinatesZodSchema,

  // isApproved is handled by Mongoose default, typically not sent in the initial request
  isApproved: z.boolean().optional().default(false),

  // Amenities: Array of strings, optional
  amenities: z.array(z.string().trim()).optional(),

  description: z
    .string()
    .min(20, 'Description must be at least 20 characters long'),
});

// --- Helper Types ---

// Infer the TypeScript type from the Zod schema for strong typing throughout your application
export type IPropertyZod = z.infer<typeof PropertyZodSchema>;
