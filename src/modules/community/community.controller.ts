import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/response.helper';
import { logActivity } from '../activityLog/activityLog.service';
import { ApiError } from '../../utils/ApiError';
import * as communityService from './community.service';
import type { RegisterCommunityDto, UpdateCommunityDto } from './community.validation';

export const listCommunities = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const communities = await communityService.listApprovedCommunities();
  sendSuccess(res, 200, 'Communities retrieved', communities);
});

export const registerCommunity = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const community = await communityService.registerCommunity(req.body as RegisterCommunityDto);
  logActivity(req, { action: 'COMMUNITY_REGISTERED' });
  sendSuccess(res, 201, 'Community registration submitted. Awaiting approval.', community);
});

export const getMyCommunity = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const community = await communityService.getMyCommunity(req.user!.uid, req.user!.email);
  sendSuccess(res, 200, 'Community retrieved', community);
});

export const getCommunityStats = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const community = req.community;
  if (!community) throw new ApiError(403, 'Community not found');
  const stats = await communityService.getCommunityStats(String(community._id));
  sendSuccess(res, 200, 'Stats retrieved', stats);
});

export const updateMyCommunity = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const community = await communityService.updateCommunity(
    req.user!.uid,
    req.body as UpdateCommunityDto,
  );
  logActivity(req, { action: 'COMMUNITY_UPDATED' });
  sendSuccess(res, 200, 'Community updated', community);
});
