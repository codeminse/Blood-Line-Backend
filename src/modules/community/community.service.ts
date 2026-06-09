import { Community } from './community.model';
import { ApiError } from '../../utils/ApiError';
import type { ICommunityDocument } from './community.interface';
import type { RegisterCommunityDto, UpdateCommunityDto } from './community.validation';

export const registerCommunity = async (dto: RegisterCommunityDto): Promise<ICommunityDocument> => {
  const existing = await Community.findOne({ email: dto.email.toLowerCase() });
  if (existing) throw new ApiError(409, 'A community with this email already exists');
  return Community.create({ ...dto, status: 'PENDING' });
};

export const getMyCommunity = async (uid: string, email: string): Promise<ICommunityDocument> => {
  // Fast path: already linked by UID
  const byUid = await Community.findOne({ adminFirebaseUid: uid });
  if (byUid) return byUid;

  // First login after approval: find by email, link UID
  const byEmail = await Community.findOneAndUpdate(
    { email: email.toLowerCase(), status: 'APPROVED', adminFirebaseUid: { $exists: false } },
    { adminFirebaseUid: uid },
    { new: true },
  );
  if (byEmail) return byEmail;

  // Show pending/rejected status so the frontend can display the right message
  const pending = await Community.findOne({ email: email.toLowerCase() });
  if (pending) return pending;

  throw new ApiError(404, 'No community found for your account');
};

export const findApprovedCommunityByUid = async (uid: string): Promise<ICommunityDocument | null> => {
  return Community.findOne({ adminFirebaseUid: uid, status: 'APPROVED' });
};

export const updateCommunity = async (
  uid: string,
  dto: UpdateCommunityDto,
): Promise<ICommunityDocument> => {
  const community = await Community.findOneAndUpdate(
    { adminFirebaseUid: uid, status: 'APPROVED' },
    { $set: dto },
    { new: true },
  );
  if (!community) throw new ApiError(404, 'Community not found');
  return community;
};

export const listApprovedCommunities = async (): Promise<Pick<ICommunityDocument, '_id' | 'name' | 'logoUrl'>[]> => {
  return Community.find({ status: 'APPROVED' }, { _id: 1, name: 1, logoUrl: 1 }).lean();
};

export const getCommunityStats = async (communityId: string) => {
  const { CommunityMember } = await import('../communityMember/communityMember.model');
  const { DonationRecord } = await import('../donationRecord/donationRecord.model');

  const [totalMembers, totalDonations] = await Promise.all([
    CommunityMember.countDocuments({ communityId }),
    DonationRecord.countDocuments({ communityId }),
  ]);

  return { totalMembers, totalDonations };
};
