import { z } from 'zod';
import { BLOOD_GROUPS } from '../../constants/bloodGroup.constant';
import { FENI_LOCATIONS } from '../../constants/location.constant';

const bangladeshiPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;

const baseDonationFields = {
  donorName: z.string().min(2, 'Donor name must be at least 2 characters').max(80).trim(),
  donorBloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: 'Invalid blood group' }) }),
  donorPhone: z.string().regex(bangladeshiPhoneRegex, 'Must be a valid Bangladeshi phone number'),
  donorProfileImageUrl: z.string().url().optional().or(z.literal('')),
  patientName: z.string().min(2).max(100).trim(),
  patientPhone: z.string().regex(bangladeshiPhoneRegex, 'Must be a valid Bangladeshi phone number'),
  hospitalName: z.string().min(2).max(200).trim().optional(),
  location: z.enum(FENI_LOCATIONS, { errorMap: () => ({ message: 'Invalid location' }) }),
  address: z.string().min(5).max(300).trim(),
  donatedAt: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).trim().optional(),
};

// Used by community donation route (communityId comes from middleware)
export const addDonationSchema = z.object(baseDonationFields);

// Used by personal donation route (donorFirebaseUid comes from req.user)
export const addPersonalDonationSchema = z.object(baseDonationFields);

export const donationListQuerySchema = z.object({
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
});

export type AddDonationDto = z.infer<typeof addDonationSchema>;
export type AddPersonalDonationDto = z.infer<typeof addPersonalDonationSchema>;
export type DonationListQuery = z.infer<typeof donationListQuerySchema>;
