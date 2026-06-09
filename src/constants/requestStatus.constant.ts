export const REQUEST_STATUSES = ['OPEN', 'FULFILLED', 'CANCELLED'] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const DEFAULT_REQUEST_STATUS: RequestStatus = 'OPEN';
