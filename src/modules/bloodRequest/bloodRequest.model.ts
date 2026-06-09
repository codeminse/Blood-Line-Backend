import { Schema, model } from 'mongoose';
import { BLOOD_GROUPS } from '../../constants/bloodGroup.constant';
import { FENI_LOCATIONS } from '../../constants/location.constant';
import { REQUEST_STATUSES, DEFAULT_REQUEST_STATUS } from '../../constants/requestStatus.constant';
import { URGENCY_LEVELS } from '../../constants/urgency.constant';
import type { IBloodRequestDocument } from './bloodRequest.interface';

const bloodRequestSchema = new Schema<IBloodRequestDocument>(
  {
    patientName: { type: String, required: true, trim: true },
    hospitalName: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    urgency: { type: String, required: true, enum: URGENCY_LEVELS },
    address: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true },
    unitsNeeded: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, enum: FENI_LOCATIONS },
    status: { type: String, enum: REQUEST_STATUSES, default: DEFAULT_REQUEST_STATUS },
    notes: { type: String, trim: true },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' },
    communityName: { type: String, trim: true },
    communityLogoUrl: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

bloodRequestSchema.index({ bloodGroup: 1, location: 1, status: 1 });
bloodRequestSchema.index({ status: 1, createdAt: -1 });

export const BloodRequest = model<IBloodRequestDocument>('BloodRequest', bloodRequestSchema);
