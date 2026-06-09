import type { Document, Types } from 'mongoose';
import type { BloodGroup } from '../../constants/bloodGroup.constant';
import type { FeniLocation } from '../../constants/location.constant';

export interface ICommunityMember {
  communityId: Types.ObjectId;
  fullName: string;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  location: FeniLocation;
  homeAddress?: string;
  profileImageUrl?: string;
  isAvailableToDonate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICommunityMemberDocument extends ICommunityMember, Document {
  _id: Types.ObjectId;
}
