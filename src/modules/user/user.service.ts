import { ApiError } from '../../utils/ApiError';
import { buildPaginationMeta } from '../../utils/response.helper';
import type { IUserDocument, SyncUserDto } from './user.interface';
import { User } from './user.model';
import { CommunityMember } from '../communityMember/communityMember.model';
import type {
  CompleteProfileDto,
  UpdateProfileDto,
  DonorSearchQuery,
  ToggleAvailabilityDto,
} from './user.validation';
import { getCache, setCache } from '../../utils/cache';

export const syncUser = async (dto: SyncUserDto): Promise<IUserDocument> => {
  const existing = await User.findOne({ firebaseUid: dto.firebaseUid });
  if (existing) return existing;

  return User.create({
    firebaseUid: dto.firebaseUid,
    email: dto.email,
    fullName: dto.fullName ?? 'Unknown',
    profileImageUrl: dto.profileImageUrl,
    isAvailableToDonate: false,
    isProfileComplete: false,
  });
};

export const getMyProfile = async (uid: string): Promise<IUserDocument> => {
  const user = await User.findOne({ firebaseUid: uid });
  if (!user) throw new ApiError(404, 'User profile not found');
  return user;
};

export const completeProfile = async (
  uid: string,
  dto: CompleteProfileDto,
  meta: { email: string; fullName?: string; profileImageUrl?: string },
): Promise<IUserDocument> => {
  let user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    user = await User.create({
      firebaseUid: uid,
      email: meta.email,
      fullName: meta.fullName ?? dto.fullName,
      profileImageUrl: meta.profileImageUrl ?? null,
      isAvailableToDonate: false,
      isProfileComplete: false,
    });
  }
  if (user.isBlocked) throw new ApiError(403, 'Your account has been blocked');

  user.fullName = dto.fullName;
  user.phoneNumber = dto.phoneNumber;
  user.bloodGroup = dto.bloodGroup;
  user.location = dto.location;
  user.homeAddress = dto.homeAddress;
  user.isAvailableToDonate = true;
  user.isProfileComplete = true;

  return user.save();
};

export const updateProfile = async (
  uid: string,
  dto: UpdateProfileDto,
): Promise<IUserDocument> => {
  const user = await User.findOne({ firebaseUid: uid });
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isBlocked) throw new ApiError(403, 'Your account has been blocked');
  if (!user.isProfileComplete) throw new ApiError(400, 'Complete your profile first');

  Object.assign(user, dto);
  return user.save();
};

export const toggleAvailability = async (
  uid: string,
  dto: ToggleAvailabilityDto,
): Promise<IUserDocument> => {
  const user = await User.findOne({ firebaseUid: uid });
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isBlocked) throw new ApiError(403, 'Your account has been blocked');

  if (dto.isAvailableToDonate && !user.isProfileComplete) {
    throw new ApiError(400, 'You must complete your profile before enabling donor availability');
  }

  user.isAvailableToDonate = dto.isAvailableToDonate;
  return user.save();
};

export const searchDonors = async (query: DonorSearchQuery) => {
  const { bloodGroup, location, page, limit } = query;
  const cacheKey = `donors:${bloodGroup ?? 'all'}:${location ?? 'all'}:${page}:${limit}`;

  const cached = await getCache<ReturnType<typeof buildResult>>(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;

  const userFilter = {
    ...(bloodGroup && { bloodGroup }),
    ...(location && { location }),
    isAvailableToDonate: true,
    isProfileComplete: true,
    isBlocked: false,
  };

  const memberFilter: Record<string, unknown> = {
    ...(bloodGroup && { bloodGroup }),
    ...(location && { location }),
    isAvailableToDonate: true,
  };

  const [rawUsers, rawMembers, totalUsers] = await Promise.all([
    User.find(userFilter)
      .select('fullName bloodGroup location homeAddress phoneNumber email profileImageUrl isAvailableToDonate isProfileComplete donationCount')
      .skip(skip)
      .limit(limit)
      .lean(),
    CommunityMember.find(memberFilter)
      .populate('communityId', 'name logoUrl')
      .lean(),
    User.countDocuments(userFilter),
  ]);

  const toInitials = (name: string) =>
    (name ?? '').split(' ').filter(Boolean).map((w: string) => w[0].toUpperCase()).slice(0, 2).join('');

  const mappedUsers = rawUsers.map((d) => ({
    id: String(d._id),
    name: d.fullName ?? '',
    initials: toInitials(d.fullName ?? ''),
    bloodGroup: d.bloodGroup ?? '',
    location: d.location ?? '',
    area: d.homeAddress ?? '',
    phone: d.phoneNumber ?? '',
    email: d.email,
    homeAddress: d.homeAddress ?? '',
    profileImageUrl: d.profileImageUrl ?? null,
    available: d.isAvailableToDonate,
    verified: d.isProfileComplete,
    donationCount: (d as unknown as { donationCount?: number }).donationCount ?? 0,
    communityId: null as string | null,
    communityName: null as string | null,
    communityLogoUrl: null as string | null,
  }));

  const mappedMembers = rawMembers.map((m) => {
    const comm = (m.communityId as unknown) as Record<string, unknown> | null;
    return {
      id: String(m._id),
      name: m.fullName ?? '',
      initials: toInitials(m.fullName ?? ''),
      bloodGroup: m.bloodGroup ?? '',
      location: m.location ?? '',
      area: m.homeAddress ?? '',
      phone: m.phone ?? '',
      email: m.email ?? '',
      homeAddress: m.homeAddress ?? '',
      profileImageUrl: m.profileImageUrl ?? null,
      available: m.isAvailableToDonate,
      verified: true,
      donationCount: 0,
      communityId: comm ? String(comm._id ?? '') : null,
      communityName: comm ? (comm.name as string) ?? null : null,
      communityLogoUrl: comm ? (comm.logoUrl as string) ?? null : null,
    };
  });

  // Community members appear first
  const donors = [...mappedMembers, ...mappedUsers];
  const result = buildResult(donors, totalUsers, page, limit);

  await setCache(cacheKey, result, 30);
  return result;
};

function buildResult(
  donors: ReturnType<typeof Array.prototype.map>,
  total: number,
  page: number,
  limit: number,
) {
  return { donors, meta: buildPaginationMeta(total, page, limit) };
}
