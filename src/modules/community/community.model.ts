import { Schema, model } from 'mongoose';
import type { ICommunityDocument } from './community.interface';

const COMMUNITY_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

const communitySchema = new Schema<ICommunityDocument>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    website: { type: String, trim: true },
    facebookPage: { type: String, trim: true },
    facebookGroup: { type: String, trim: true },
    documentUrl: { type: String },
    status: { type: String, enum: COMMUNITY_STATUSES, default: 'PENDING' },
    adminFirebaseUid: { type: String },
  },
  { timestamps: true, versionKey: false },
);

communitySchema.index({ email: 1 });
communitySchema.index({ status: 1 });
communitySchema.index({ adminFirebaseUid: 1 });

export const Community = model<ICommunityDocument>('Community', communitySchema);
