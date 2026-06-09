import { Types } from 'mongoose';
import { DonationRecord } from './donationRecord.model';
import { User } from '../user/user.model';
import { buildPaginationMeta } from '../../utils/response.helper';
import type { IDonationRecordDocument } from './donationRecord.interface';
import type { AddDonationDto, AddPersonalDonationDto, DonationListQuery } from './donationRecord.validation';
import { getCache, setCache } from '../../utils/cache';

export const addDonation = async (
  communityId: string,
  dto: AddDonationDto,
): Promise<IDonationRecordDocument> => {
  return DonationRecord.create({
    ...dto,
    communityId: new Types.ObjectId(communityId),
    donatedAt: new Date(dto.donatedAt),
  });
};

export const addPersonalDonation = async (
  firebaseUid: string,
  dto: AddPersonalDonationDto,
): Promise<IDonationRecordDocument> => {
  const [donation] = await Promise.all([
    DonationRecord.create({
      ...dto,
      communityId: null,
      donorFirebaseUid: firebaseUid,
      donatedAt: new Date(dto.donatedAt),
    }),
    User.findOneAndUpdate({ firebaseUid }, { $inc: { donationCount: 1 } }),
  ]);
  return donation;
};

export const listDonations = async (communityId: string, query: DonationListQuery) => {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [donations, total] = await Promise.all([
    DonationRecord.find({ communityId: new Types.ObjectId(communityId) })
      .sort({ donatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('communityId', 'name logoUrl')
      .lean(),
    DonationRecord.countDocuments({ communityId: new Types.ObjectId(communityId) }),
  ]);

  return { donations, meta: buildPaginationMeta(total, page, limit) };
};

export const getMyDonations = async (firebaseUid: string, query: DonationListQuery) => {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const filter = { donorFirebaseUid: firebaseUid };

  const [donations, total] = await Promise.all([
    DonationRecord.find(filter)
      .sort({ donatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('communityId', 'name logoUrl')
      .lean(),
    DonationRecord.countDocuments(filter),
  ]);

  return { donations, meta: buildPaginationMeta(total, page, limit) };
};

export const getTopDonors = async (communityId: string, limit = 10) => {
  return DonationRecord.aggregate([
    { $match: { communityId: new Types.ObjectId(communityId) } },
    {
      $group: {
        _id: '$donorPhone',
        donorName: { $last: '$donorName' },
        donorBloodGroup: { $last: '$donorBloodGroup' },
        donorProfileImageUrl: { $last: '$donorProfileImageUrl' },
        donationCount: { $sum: 1 },
      },
    },
    { $sort: { donationCount: -1 } },
    { $limit: limit },
  ]);
};

export const getAllDonations = async (query: DonationListQuery) => {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [donations, total] = await Promise.all([
    DonationRecord.find()
      .sort({ donatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('communityId', 'name logoUrl')
      .lean(),
    DonationRecord.countDocuments(),
  ]);

  return { donations, meta: buildPaginationMeta(total, page, limit) };
};

export const getRecentDonations = async (limit = 20) => {
  const cacheKey = `donations:recent:${limit}`;

  const cached = await getCache<unknown[]>(cacheKey);
  if (cached) return cached;

  const donations = await DonationRecord.find()
    .sort({ donatedAt: -1 })
    .limit(limit)
    .populate('communityId', 'name logoUrl')
    .lean();

  await setCache(cacheKey, donations, 120);
  return donations;
};
