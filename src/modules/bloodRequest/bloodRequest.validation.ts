import { z } from 'zod';
import { BLOOD_GROUPS } from '../../constants/bloodGroup.constant';
import { FENI_LOCATIONS } from '../../constants/location.constant';
import { REQUEST_STATUSES } from '../../constants/requestStatus.constant';
import { URGENCY_LEVELS } from '../../constants/urgency.constant';

const bangladeshiPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;

export const createBloodRequestSchema = z.object({
  patientName: z.string().min(2, 'Patient name must be at least 2 characters').max(100).trim(),
  hospitalName: z.string().min(2, 'Hospital name must be at least 2 characters').max(150).trim(),
  bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: 'Invalid blood group' }) }),
  urgency: z.enum(URGENCY_LEVELS, { errorMap: () => ({ message: 'Invalid urgency level' }) }),
  address: z.string().min(5, 'Address must be at least 5 characters').max(300).trim(),
  contactNumber: z
    .string()
    .regex(bangladeshiPhoneRegex, 'Must be a valid Bangladeshi phone number'),
  unitsNeeded: z
    .number({ invalid_type_error: 'Units needed must be a number' })
    .int()
    .min(1, 'At least 1 unit required')
    .max(20),
  location: z.enum(FENI_LOCATIONS, {
    errorMap: () => ({ message: 'Location must be a valid Feni subdistrict' }),
  }),
  notes: z.string().max(500).trim().optional(),
  communityId: z.string().length(24).optional(),
  communityName: z.string().max(100).trim().optional(),
  communityLogoUrl: z.string().url().optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(REQUEST_STATUSES, {
    errorMap: () => ({ message: 'Status must be OPEN, FULFILLED, or CANCELLED' }),
  }),
});

export const listRequestsQuerySchema = z.object({
  hospitalName: z.string().max(150).trim().optional(),
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
  status: z
    .enum(REQUEST_STATUSES, {
      errorMap: () => ({ message: 'Invalid status' }),
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

export const requestIdParamSchema = z.object({
  id: z.string().length(24, 'Invalid request ID'),
});

export type CreateBloodRequestDto = z.infer<typeof createBloodRequestSchema>;
export type UpdateRequestStatusDto = z.infer<typeof updateRequestStatusSchema>;
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;
