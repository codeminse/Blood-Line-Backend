import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/response.helper';
import { logActivity } from '../activityLog/activityLog.service';
import * as memberService from './communityMember.service';
import type { AddMemberDto, UpdateMemberDto, MemberListQuery } from './communityMember.validation';

export const addMember = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const communityId = String(req.community!._id);
  const member = await memberService.addMember(communityId, req.body as AddMemberDto);
  logActivity(req, { action: 'COMMUNITY_MEMBER_ADDED' });
  sendSuccess(res, 201, 'Member added successfully', member);
});

export const listMembers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const communityId = String(req.community!._id);
  const { members, meta } = await memberService.listMembers(
    communityId,
    req.query as unknown as MemberListQuery,
  );
  sendSuccess(res, 200, 'Members retrieved', members, meta);
});

export const updateMember = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const communityId = String(req.community!._id);
  const member = await memberService.updateMember(
    communityId,
    req.params.memberId,
    req.body as UpdateMemberDto,
  );
  logActivity(req, { action: 'COMMUNITY_MEMBER_UPDATED' });
  sendSuccess(res, 200, 'Member updated', member);
});

export const deleteMember = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const communityId = String(req.community!._id);
  await memberService.deleteMember(communityId, req.params.memberId);
  logActivity(req, { action: 'COMMUNITY_MEMBER_DELETED' });
  sendSuccess(res, 200, 'Member removed', null);
});
