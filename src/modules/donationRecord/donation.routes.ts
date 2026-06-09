import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addPersonalDonationSchema, donationListQuerySchema } from './donationRecord.validation';
import {
  addPersonalDonation,
  getAllDonations,
  getMyDonations,
  getRecentDonations,
} from './donationRecord.controller';

const router = Router();

router.get('/recent', getRecentDonations);
router.get('/', validate(donationListQuerySchema, 'query'), getAllDonations);
router.post('/', authenticate, validate(addPersonalDonationSchema), addPersonalDonation);
router.get('/my', authenticate, validate(donationListQuerySchema, 'query'), getMyDonations);

export default router;
