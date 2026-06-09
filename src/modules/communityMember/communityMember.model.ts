import { Schema, model } from 'mongoose';
import { BLOOD_GROUPS } from '../../constants/bloodGroup.constant';
import { FENI_LOCATIONS } from '../../constants/location.constant';
import type { ICommunityMemberDocument } from './communityMember.interface';

const communityMemberSchema = new Schema<ICommunityMemberDocument>(
  {
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    fullName: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    location: { type: String, required: true, enum: FENI_LOCATIONS },
    homeAddress: { type: String, trim: true },
    profileImageUrl: { type: String },
    isAvailableToDonate: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

communityMemberSchema.index({ communityId: 1 });
communityMemberSchema.index({ bloodGroup: 1, location: 1, isAvailableToDonate: 1 });

export const CommunityMember = model<ICommunityMemberDocument>('CommunityMember', communityMemberSchema);
