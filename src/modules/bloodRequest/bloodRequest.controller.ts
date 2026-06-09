import type { Request, Response } from 'express';
import { logActivity } from '../activityLog/activityLog.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/response.helper';
import * as bloodRequestService from './bloodRequest.service';
import type {
  CreateBloodRequestDto,
  UpdateRequestStatusDto,
  ListRequestsQuery,
} from './bloodRequest.validation';

export const createRequest = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const request = await bloodRequestService.createRequest(req.body as CreateBloodRequestDto);
  logActivity(req, { action: 'BLOOD_REQUEST_POSTED' });
  sendSuccess(res, 201, 'Emergency blood request submitted successfully', request);
});

export const listRequests = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { requests, meta } = await bloodRequestService.listRequests(
    req.query as unknown as ListRequestsQuery,
  );
  sendSuccess(res, 200, 'Blood requests retrieved successfully', requests, meta);
});

export const getRequestById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const request = await bloodRequestService.getRequestById(req.params.id);
  sendSuccess(res, 200, 'Blood request retrieved successfully', request);
});

export const updateRequestStatus = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const request = await bloodRequestService.updateRequestStatus(
    req.params.id,
    req.body as UpdateRequestStatusDto,
  );
  sendSuccess(res, 200, 'Blood request status updated', request);
});
