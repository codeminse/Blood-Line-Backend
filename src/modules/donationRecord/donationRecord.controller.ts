import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/response.helper';
import { logActivity } from '../activityLog/activityLog.service';
import * as donationService from './donationRecord.service';
import type { AddDonationDto, AddPersonalDonationDto, DonationListQuery } from './donationRecord.validation';

export const addDonation = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const communityId = String(req.community!._id);
  const donation = await donationService.addDonation(communityId, req.body as AddDonationDto);
  logActivity(req, { action: 'DONATION_RECORDED' });
  sendSuccess(res, 201, 'Donation recorded successfully', donation);
});

export const listDonations = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const communityId = String(req.community!._id);
  const { donations, meta } = await donationService.listDonations(
    communityId,
    req.query as unknown as DonationListQuery,
  );
  sendSuccess(res, 200, 'Donations retrieved', donations, meta);
});

export const addPersonalDonation = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const uid = req.user!.uid;
  const donation = await donationService.addPersonalDonation(uid, req.body as AddPersonalDonationDto);
  logActivity(req, { action: 'DONATION_RECORDED' });
  sendSuccess(res, 201, 'Donation recorded successfully', donation);
});

export const getMyDonations = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const uid = req.user!.uid;
  const { donations, meta } = await donationService.getMyDonations(
    uid,
    req.query as unknown as DonationListQuery,
  );
  sendSuccess(res, 200, 'Your donations retrieved', donations, meta);
});

export const getTopDonors = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const communityId = String(req.community!._id);
  const donors = await donationService.getTopDonors(communityId, 10);
  sendSuccess(res, 200, 'Top donors retrieved', donors);
});

export const getAllDonations = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { donations, meta } = await donationService.getAllDonations(
    req.query as unknown as DonationListQuery,
  );
  sendSuccess(res, 200, 'Donations retrieved', donations, meta);
});

export const getRecentDonations = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const donations = await donationService.getRecentDonations(20);
  sendSuccess(res, 200, 'Recent donations retrieved', donations);
});
