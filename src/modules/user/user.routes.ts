import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  completeProfileSchema,
  updateProfileSchema,
  toggleAvailabilitySchema,
  donorSearchSchema,
} from './user.validation';
import * as userController from './user.controller';

const router = Router();

router.post('/sync', authenticate, userController.syncUser);

router.get('/me', authenticate, userController.getMyProfile);

router.patch(
  '/me/profile',
  authenticate,
  validate(completeProfileSchema),
  userController.completeProfile,
);

router.put(
  '/me/profile',
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile,
);

router.patch(
  '/me/availability',
  authenticate,
  validate(toggleAvailabilitySchema),
  userController.toggleAvailability,
);

router.get('/search', validate(donorSearchSchema, 'query'), userController.searchDonors);

export default router;
