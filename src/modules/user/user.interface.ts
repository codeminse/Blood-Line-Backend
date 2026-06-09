import type { Document, Types } from 'mongoose';
import type { BloodGroup } from '../../constants/bloodGroup.constant';
import type { FeniLocation } from '../../constants/location.constant';

export interface IUser {
  firebaseUid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  bloodGroup?: BloodGroup;
  location?: FeniLocation;
  profileImageUrl?: string;
  isAvailableToDonate: boolean;
  isProfileComplete: boolean;
  isBlocked: boolean;
  homeAddress?: string;
  lastDonationDate?: Date;
  donationCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

export interface CompleteProfileDto {
  fullName: string;
  phoneNumber: string;
  bloodGroup: BloodGroup;
  location: FeniLocation;
  homeAddress?: string;
}

export interface SyncUserDto {
  firebaseUid: string;
  email: string;
  fullName?: string;
  profileImageUrl?: string;
}
