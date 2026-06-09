import { BloodRequest } from './bloodRequest.model';
import { ApiError } from '../../utils/ApiError';
import { buildPaginationMeta } from '../../utils/response.helper';
import type { IBloodRequestDocument } from './bloodRequest.interface';
import type {
  CreateBloodRequestDto,
  UpdateRequestStatusDto,
  ListRequestsQuery,
} from './bloodRequest.validation';
import { getCache, setCache } from '../../utils/cache';
import type { PaginationMeta } from '../../interfaces/common.interface';

export const createRequest = async (
  dto: CreateBloodRequestDto,
): Promise<IBloodRequestDocument> => {
  return BloodRequest.create(dto);
};

export const listRequests = async (query: ListRequestsQuery) => {
  const { hospitalName, bloodGroup, location, status, page, limit } = query;
  const effectiveStatus = status ?? 'OPEN';
  const cacheKey = `blood-requests:${effectiveStatus}:${bloodGroup ?? 'all'}:${location ?? 'all'}:${hospitalName ?? 'all'}:${page}:${limit}`;

  const cached = await getCache<{ requests: unknown[]; meta: PaginationMeta }>(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (hospitalName) filter.hospitalName = { $regex: hospitalName, $options: 'i' };
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (location) filter.location = location;
  filter.status = effectiveStatus;

  const [requests, total] = await Promise.all([
    BloodRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    BloodRequest.countDocuments(filter),
  ]);

  const result = { requests, meta: buildPaginationMeta(total, page, limit) };
  await setCache(cacheKey, result, 30);
  return result;
};

export const getRequestById = async (id: string): Promise<IBloodRequestDocument> => {
  const request = await BloodRequest.findById(id);
  if (!request) throw new ApiError(404, 'Blood request not found');
  return request;
};

export const updateRequestStatus = async (
  id: string,
  dto: UpdateRequestStatusDto,
): Promise<IBloodRequestDocument> => {
  const request = await BloodRequest.findById(id);
  if (!request) throw new ApiError(404, 'Blood request not found');

  request.status = dto.status;
  return request.save();
};
