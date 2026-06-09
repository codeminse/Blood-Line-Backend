import type { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        name?: string;
        picture?: string;
      };
    }
  }
}

export const authenticate = catchAsync(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Missing or malformed Authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      req.user = {
        uid: decoded.uid,
        email: decoded.email ?? '',
        name: decoded.name,
        picture: decoded.picture,
      };
      next();
    } catch {
      throw new ApiError(401, 'Invalid or expired Firebase token');
    }
  },
);
