import type { Document, Types } from 'mongoose';
import type { BloodGroup } from '../../constants/bloodGroup.constant';
import type { FeniLocation } from '../../constants/location.constant';
import type { RequestStatus } from '../../constants/requestStatus.constant';
import type { UrgencyLevel } from '../../constants/urgency.constant';

export interface IBloodRequest {
  patientName: string;
  hospitalName: string;
  bloodGroup: BloodGroup;
  urgency: UrgencyLevel;
  address: string;
  contactNumber: string;
  unitsNeeded: number;
  location: FeniLocation;
  status: RequestStatus;
  notes?: string;
  communityId?: Types.ObjectId;
  communityName?: string;
  communityLogoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBloodRequestDocument extends IBloodRequest, Document {
  _id: Types.ObjectId;
}
