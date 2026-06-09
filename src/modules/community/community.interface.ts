import type { Document, Types } from 'mongoose';

export type CommunityStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ICommunity {
  name: string;
  logoUrl: string;
  phone: string;
  email: string;
  website?: string;
  facebookPage?: string;
  facebookGroup?: string;
  documentUrl?: string;
  status: CommunityStatus;
  adminFirebaseUid?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICommunityDocument extends ICommunity, Document {
  _id: Types.ObjectId;
}
