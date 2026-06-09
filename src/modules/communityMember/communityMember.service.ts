import { Types } from 'mongoose';
import { CommunityMember } from './communityMember.model';
import { ApiError } from '../../utils/ApiError';
import { buildPaginationMeta } from '../../utils/response.helper';
import type { ICommunityMemberDocument } from './communityMember.interface';
import type { AddMemberDto, UpdateMemberDto, MemberListQuery } from './communityMember.validation';

export const addMember = async (
  communityId: string,
  dto: AddMemberDto,
): Promise<ICommunityMemberDocument> => {
  return CommunityMember.create({ ...dto, communityId: new Types.ObjectId(communityId) });
};

export const listMembers = async (communityId: string, query: MemberListQuery) => {
  const { page, limit, bloodGroup, location, search } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { communityId: new Types.ObjectId(communityId) };
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (location) filter.location = location;
  if (search) filter.fullName = { $regex: search, $options: 'i' };

  const [members, total] = await Promise.all([
    CommunityMember.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    CommunityMember.countDocuments(filter),
  ]);

  return { members, meta: buildPaginationMeta(total, page, limit) };
};

export const updateMember = async (
  communityId: string,
  memberId: string,
  dto: UpdateMemberDto,
): Promise<ICommunityMemberDocument> => {
  const member = await CommunityMember.findOneAndUpdate(
    { _id: memberId, communityId: new Types.ObjectId(communityId) },
    { $set: dto },
    { new: true },
  );
  if (!member) throw new ApiError(404, 'Member not found');
  return member;
};

export const deleteMember = async (communityId: string, memberId: string): Promise<void> => {
  const result = await CommunityMember.deleteOne({
    _id: memberId,
    communityId: new Types.ObjectId(communityId),
  });
  if (result.deletedCount === 0) throw new ApiError(404, 'Member not found');
};
