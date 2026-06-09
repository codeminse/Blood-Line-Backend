import { Schema, model } from 'mongoose';
import { BLOOD_GROUPS } from '../../constants/bloodGroup.constant';
import { FENI_LOCATIONS } from '../../constants/location.constant';
import type { IDonationRecordDocument } from './donationRecord.interface';

const donationRecordSchema = new Schema<IDonationRecordDocument>(
  {
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', default: null },
    donorFirebaseUid: { type: String, default: null },
    donorName: { type: String, required: true, trim: true },
    donorBloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    donorPhone: { type: String, required: true },
    donorProfileImageUrl: { type: String },
    patientName: { type: String, required: true, trim: true },
    patientPhone: { type: String, required: true },
    hospitalName: { type: String, trim: true },
    location: { type: String, required: true, enum: FENI_LOCATIONS },
    address: { type: String, required: true, trim: true },
    donatedAt: { type: Date, required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false },
);

donationRecordSchema.index({ communityId: 1, donatedAt: -1 });
donationRecordSchema.index({ donorFirebaseUid: 1, donatedAt: -1 });
donationRecordSchema.index({ donatedAt: -1 });

export const DonationRecord = model<IDonationRecordDocument>('DonationRecord', donationRecordSchema);
