import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/response.helper';
import { logActivity } from './activityLog.service';

export const trackVisit = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { page } = req.body as { page?: string };
  logActivity(req, { action: `PAGE_VISIT: ${page ?? 'unknown'}` });
  sendSuccess(res, 200, 'Visit tracked', null);
});
