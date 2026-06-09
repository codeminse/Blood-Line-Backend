import type { Request, Response } from 'express';
import { logActivity } from '../activityLog/activityLog.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/response.helper';
import * as userService from './user.service';
import type { CompleteProfileDto, UpdateProfileDto, ToggleAvailabilityDto, DonorSearchQuery } from './user.validation';
import type { SyncUserDto } from './user.interface';

export const syncUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { uid, email, name, picture } = req.user!;
  const dto: SyncUserDto = { firebaseUid: uid, email, fullName: name, profileImageUrl: picture };
  const user = await userService.syncUser(dto);
  sendSuccess(res, 200, 'User synced successfully', user);
});

export const getMyProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.getMyProfile(req.user!.uid);
  sendSuccess(res, 200, 'Profile retrieved', user);
});

export const completeProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { uid, email, name, picture } = req.user!;
  const user = await userService.completeProfile(
    uid,
    req.body as CompleteProfileDto,
    { email, fullName: name, profileImageUrl: picture },
  );
  logActivity(req, { action: 'USER_REGISTERED' });
  sendSuccess(res, 200, 'Profile completed successfully', user);
});

export const updateProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.updateProfile(req.user!.uid, req.body as UpdateProfileDto);
  sendSuccess(res, 200, 'Profile updated successfully', user);
});

export const toggleAvailability = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.toggleAvailability(
    req.user!.uid,
    req.body as ToggleAvailabilityDto,
  );
  const status = user.isAvailableToDonate ? 'available' : 'unavailable';
  sendSuccess(res, 200, `You are now marked as ${status} for donation`, user);
});

export const searchDonors = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { donors, meta } = await userService.searchDonors(req.query as unknown as DonorSearchQuery);
  sendSuccess(res, 200, 'Donors retrieved successfully', donors, meta);
});
