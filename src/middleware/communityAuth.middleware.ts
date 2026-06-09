import type { Request, Response, NextFunction } from 'express';
import { Community } from '../modules/community/community.model';
import type { ICommunityDocument } from '../modules/community/community.interface';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';

declare global {
  namespace Express {
    interface Request {
      community?: ICommunityDocument;
    }
  }
}

export const communityAuth = catchAsync(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const uid = req.user?.uid;
    const email = req.user?.email;

    if (!uid || !email) {
      throw new ApiError(401, 'Authentication required');
    }

    // Try by uid first (already linked)
    let community = await Community.findOne({ adminFirebaseUid: uid, status: 'APPROVED' });

    // Try linking by email if not yet linked
    if (!community) {
      community = await Community.findOneAndUpdate(
        { email: email.toLowerCase(), status: 'APPROVED', adminFirebaseUid: { $exists: false } },
        { adminFirebaseUid: uid },
        { new: true },
      );
    }

    if (!community) {
      throw new ApiError(403, 'No approved community associated with your account');
    }

    req.community = community;
    next();
  },
);
