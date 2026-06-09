import { z } from 'zod';
import { BLOOD_GROUPS } from '../../constants/bloodGroup.constant';
import { FENI_LOCATIONS } from '../../constants/location.constant';

const bangladeshiPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;

export const addMemberSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80).trim(),
  bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: 'Invalid blood group' }) }),
  phone: z.string().regex(bangladeshiPhoneRegex, 'Must be a valid Bangladeshi phone number'),
  email: z.string().email('Must be a valid email address'),
  location: z.enum(FENI_LOCATIONS, { errorMap: () => ({ message: 'Invalid location' }) }),
  homeAddress: z.string().min(5).max(200).trim().optional(),
  profileImageUrl: z.string().url().optional().or(z.literal('')),
  isAvailableToDonate: z.boolean().optional(),
});

export const updateMemberSchema = addMemberSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export const memberIdParamSchema = z.object({
  memberId: z.string().length(24, 'Invalid member ID'),
});

export const memberListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .refine((v) => v > 0),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .refine((v) => v > 0 && v <= 100),
  bloodGroup: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.replace(/ /g, '+') : val),
      z.enum(BLOOD_GROUPS).optional(),
    ),
  location: z.enum(FENI_LOCATIONS).optional(),
  search: z.string().max(80).optional(),
});

export type AddMemberDto = z.infer<typeof addMemberSchema>;
export type UpdateMemberDto = z.infer<typeof updateMemberSchema>;
export type MemberListQuery = z.infer<typeof memberListQuerySchema>;
