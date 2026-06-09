import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { communityAuth } from '../../middleware/communityAuth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { registerCommunitySchema, updateCommunitySchema } from './community.validation';
import * as communityController from './community.controller';
import { getTopDonors } from '../donationRecord/donationRecord.controller';
import memberRouter from '../communityMember/communityMember.routes';
import donationRouter from '../donationRecord/donationRecord.routes';

const router = Router();

// Public: list approved communities
router.get('/', communityController.listCommunities);

// Public registration
router.post('/', validate(registerCommunitySchema), communityController.registerCommunity);

// Get my community status (any authenticated user — shows PENDING too)
router.get('/my', authenticate, communityController.getMyCommunity);

// Community admin only routes
router.get('/my/stats', authenticate, communityAuth, communityController.getCommunityStats);
router.get('/my/top-donors', authenticate, communityAuth, getTopDonors);
router.patch('/my', authenticate, communityAuth, validate(updateCommunitySchema), communityController.updateMyCommunity);

// Nested: member & donation management (community admin only)
router.use('/my/members', authenticate, communityAuth, memberRouter);
router.use('/my/donations', authenticate, communityAuth, donationRouter);

export default router;
