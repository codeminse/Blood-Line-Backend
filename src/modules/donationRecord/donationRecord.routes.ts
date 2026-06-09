import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { addDonationSchema, donationListQuerySchema } from './donationRecord.validation';
import * as donationController from './donationRecord.controller';

// auth + communityAuth are applied by the parent community router
const router = Router();

router.post('/', validate(addDonationSchema), donationController.addDonation);
router.get('/', validate(donationListQuerySchema, 'query'), donationController.listDonations);

export default router;
