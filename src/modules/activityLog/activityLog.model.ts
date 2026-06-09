import mongoose, { Schema, Document } from 'mongoose';

interface IIPData {
  country?: string;
  countryCode?: string;
  continent?: string;
  continentCode?: string;
  city?: string;
  county?: string;
  region?: string;
  regionCode?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  currency?: string;
  languages?: string[];
}

export interface IActivityLog extends Document {
  ip: string;
  method?: string;
  path?: string;
  action?: string;
  userId?: string;
  email?: string;
  phone?: string;
  ipData?: IIPData | null;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ipDataSchema = new Schema<IIPData>(
  {
    country: String,
    countryCode: String,
    continent: String,
    continentCode: String,
    city: String,
    county: String,
    region: String,
    regionCode: String,
    timezone: String,
    latitude: Number,
    longitude: Number,
    currency: String,
    languages: [String],
  },
  { _id: false },
);

const activityLogSchema = new Schema<IActivityLog>(
  {
    ip: { type: String, required: true },
    method: String,
    path: String,
    action: String,
    userId: String,
    email: String,
    phone: String,
    ipData: { type: ipDataSchema, default: null },
    userAgent: String,
  },
  { timestamps: true },
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ ip: 1, createdAt: -1 });
activityLogSchema.index({ email: 1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
