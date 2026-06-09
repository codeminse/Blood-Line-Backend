import type { Document, Types } from 'mongoose';
import type { BloodGroup } from '../../constants/bloodGroup.constant';
import type { FeniLocation } from '../../constants/location.constant';

export interface IDonationRecord {
  communityId?: Types.ObjectId | null;
  donorFirebaseUid?: string | null;
  donorName: string;
  donorBloodGroup: BloodGroup;
  donorPhone: string;
  donorProfileImageUrl?: string;
  patientName: string;
  patientPhone: string;
  hospitalName?: string;
  location: FeniLocation;
  address: string;
  donatedAt: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDonationRecordDocument extends IDonationRecord, Document {
  _id: Types.ObjectId;
}
