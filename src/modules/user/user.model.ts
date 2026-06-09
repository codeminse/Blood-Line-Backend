import { Schema, model } from 'mongoose';
import { BLOOD_GROUPS } from '../../constants/bloodGroup.constant';
import { FENI_LOCATIONS } from '../../constants/location.constant';
import type { IUserDocument } from './user.interface';

const userSchema = new Schema<IUserDocument>(
  {
    firebaseUid: { type: String, required: true, unique: true, immutable: true },
    fullName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, immutable: true, lowercase: true },

    phoneNumber: { type: String },
    bloodGroup: { type: String, enum: BLOOD_GROUPS },
    location: { type: String, enum: FENI_LOCATIONS },

    homeAddress: { type: String },
    profileImageUrl: { type: String, immutable: true },
    isAvailableToDonate: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    lastDonationDate: { type: Date },
    donationCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ bloodGroup: 1, location: 1, isAvailableToDonate: 1, isProfileComplete: 1 });

export const User = model<IUserDocument>('User', userSchema);
