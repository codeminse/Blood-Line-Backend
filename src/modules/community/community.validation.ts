import { z } from 'zod';

const bangladeshiPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
const optionalUrl = z.string().url('Must be a valid URL').optional().or(z.literal(''));

export const registerCommunitySchema = z.object({
  name: z.string().min(2, 'Community name must be at least 2 characters').max(100).trim(),
  logoUrl: z.string().url('Logo URL must be a valid URL'),
  phone: z.string().regex(bangladeshiPhoneRegex, 'Must be a valid Bangladeshi phone number'),
  email: z.string().email('Must be a valid email address').toLowerCase(),
  website: optionalUrl,
  facebookPage: optionalUrl,
  facebookGroup: optionalUrl,
  documentUrl: optionalUrl,
});

export const updateCommunitySchema = z
  .object({
    name: z.string().min(2).max(100).trim().optional(),
    logoUrl: z.string().url().optional(),
    phone: z.string().regex(bangladeshiPhoneRegex).optional(),
    website: optionalUrl,
    facebookPage: optionalUrl,
    facebookGroup: optionalUrl,
    documentUrl: optionalUrl,
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export type RegisterCommunityDto = z.infer<typeof registerCommunitySchema>;
export type UpdateCommunityDto = z.infer<typeof updateCommunitySchema>;
