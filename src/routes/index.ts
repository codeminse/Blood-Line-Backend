import { Router } from 'express';
import userRoutes from '../modules/user/user.routes';
import bloodRequestRoutes from '../modules/bloodRequest/bloodRequest.routes';
import activityLogRoutes from '../modules/activityLog/activityLog.routes';
import communityRoutes from '../modules/community/community.routes';
import uploadRoutes from '../modules/upload/upload.routes';
import donationRoutes from '../modules/donationRecord/donation.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/blood-requests', bloodRequestRoutes);
router.use('/track', activityLogRoutes);
router.use('/communities', communityRoutes);
router.use('/upload', uploadRoutes);
router.use('/donations', donationRoutes);

export default router;
