import { z } from 'zod';
import { BLOOD_GROUPS } from '../../constants/bloodGroup.constant';
import { FENI_LOCATIONS } from '../../constants/location.constant';

const bangladeshiPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;

export const completeProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80).trim(),
  phoneNumber: z
    .string()
    .regex(bangladeshiPhoneRegex, 'Must be a valid Bangladeshi phone number (e.g. 01XXXXXXXXX)'),
  bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: 'Invalid blood group' }) }),
  location: z.enum(FENI_LOCATIONS, {
    errorMap: () => ({ message: 'Location must be a valid Feni subdistrict' }),
  }),
  homeAddress: z.string().min(5, 'Home address must be at least 5 characters').max(200).optional(),
});

export const toggleAvailabilitySchema = z.object({
  isAvailableToDonate: z.boolean(),
});

export const donorSearchSchema = z.object({
  bloodGroup: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.replace(/ /g, '+') : val),
      z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: 'Invalid blood group' }) }).optional(),
    ),
  location: z
    .enum(FENI_LOCATIONS, {
      errorMap: () => ({ message: 'Location must be a valid Feni subdistrict' }),
    })
    .optional(),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .refine((v) => v > 0, { message: 'Page must be a positive number' }),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .refine((v) => v > 0 && v <= 100, { message: 'Limit must be between 1 and 100' }),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80).trim().optional(),
  phoneNumber: z
    .string()
    .regex(bangladeshiPhoneRegex, 'Must be a valid Bangladeshi phone number (e.g. 01XXXXXXXXX)')
    .optional(),
  bloodGroup: z
    .enum(BLOOD_GROUPS, { errorMap: () => ({ message: 'Invalid blood group' }) })
    .optional(),
  location: z
    .enum(FENI_LOCATIONS, { errorMap: () => ({ message: 'Location must be a valid Feni subdistrict' }) })
    .optional(),
  homeAddress: z.string().min(5, 'Home address must be at least 5 characters').max(200).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export type CompleteProfileDto = z.infer<typeof completeProfileSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type ToggleAvailabilityDto = z.infer<typeof toggleAvailabilitySchema>;
export type DonorSearchQuery = z.infer<typeof donorSearchSchema>;
