import { Router } from 'express';
import { trackVisit } from './activityLog.controller';

const router = Router();

// Public — works for both guests and authenticated users
router.post('/visit', trackVisit);

export default router;
