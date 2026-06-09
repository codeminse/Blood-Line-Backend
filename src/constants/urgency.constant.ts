export const URGENCY_LEVELS = ['URGENT', 'HIGH', 'NEEDED'] as const;
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];
