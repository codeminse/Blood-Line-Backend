/**
 * Seed script — populates the database with realistic demo data.
 * Run: npx ts-node src/seed.ts
 *
 * Safe to run multiple times — clears previous seed data first (identified
 * by the SEED_ prefix on Firebase UIDs / emails).
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

import mongoose, { Types } from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// --- Models (import after env is loaded) ---
import { User } from './modules/user/user.model';
import { Community } from './modules/community/community.model';
import { CommunityMember } from './modules/communityMember/communityMember.model';
import { DonationRecord } from './modules/donationRecord/donationRecord.model';
import { BloodRequest } from './modules/bloodRequest/bloodRequest.model';
import { env } from './config/env';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function avatar(name: string, bg = 'dc2626') {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=128&bold=true`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3_600_000);
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const USERS = [
  { uid: 'SEED_USER_001', name: 'Arif Hossain',    phone: '01711000001', blood: 'A+',  loc: 'Feni Sadar',    addr: 'Mohipal, Feni Sadar' },
  { uid: 'SEED_USER_002', name: 'Fatema Begum',    phone: '01711000002', blood: 'B+',  loc: 'Sonagazi',      addr: 'Char Elahi, Sonagazi' },
  { uid: 'SEED_USER_003', name: 'Karim Ahmed',     phone: '01711000003', blood: 'O+',  loc: 'Chhagalnaiya',  addr: 'Rampur Bazar, Chhagalnaiya' },
  { uid: 'SEED_USER_004', name: 'Nasrin Khatun',   phone: '01711000004', blood: 'AB+', loc: 'Daganbhuiyan',  addr: 'Manikpur, Daganbhuiyan' },
  { uid: 'SEED_USER_005', name: 'Rakib Mia',       phone: '01711000005', blood: 'A-',  loc: 'Parshuram',     addr: 'Mirsarai Para, Parshuram' },
  { uid: 'SEED_USER_006', name: 'Sumaiya Islam',   phone: '01711000006', blood: 'B-',  loc: 'Fulgazi',       addr: 'Fazilpur, Fulgazi' },
  { uid: 'SEED_USER_007', name: 'Jahangir Alam',   phone: '01711000007', blood: 'O-',  loc: 'Feni Sadar',    addr: 'Trunk Road, Feni' },
  { uid: 'SEED_USER_008', name: 'Maliha Sultana',  phone: '01711000008', blood: 'A+',  loc: 'Sonagazi',      addr: 'Noapara, Sonagazi' },
  { uid: 'SEED_USER_009', name: 'Touhid Rahman',   phone: '01711000009', blood: 'O+',  loc: 'Feni Sadar',    addr: 'Shantirhat, Feni' },
  { uid: 'SEED_USER_010', name: 'Rifat Jahan',     phone: '01711000010', blood: 'B+',  loc: 'Chhagalnaiya',  addr: 'Munsirhat, Chhagalnaiya' },
];

// Two community admins (these Firebase UIDs would belong to real Google accounts
// you control — update them if you want to log in as a community admin)
const COMM_ADMIN_1_UID = 'SEED_ADMIN_001';
const COMM_ADMIN_2_UID = '';   // PENDING — no UID yet

const COMMUNITIES = [
  {
    name: 'Feni Blood Warriors',
    email: 'seed.warriors@fenibloodline.com',
    phone: '01811100001',
    logoUrl: 'https://ui-avatars.com/api/?name=FBW&background=dc2626&color=fff&size=128&bold=true',
    website: 'https://fenibloodwarriors.org',
    facebookPage: 'https://facebook.com/fenibloodwarriors',
    facebookGroup: 'https://facebook.com/groups/fenibloodwarriors',
    status: 'APPROVED',
    adminFirebaseUid: COMM_ADMIN_1_UID,
    description: 'Dedicated blood donor community serving Feni Sadar since 2018.',
  },
  {
    name: 'Sonagazi Life Savers',
    email: 'seed.lifesavers@fenibloodline.com',
    phone: '01811100002',
    logoUrl: 'https://ui-avatars.com/api/?name=SLS&background=2563eb&color=fff&size=128&bold=true',
    website: '',
    facebookPage: 'https://facebook.com/sonagazilifesavers',
    facebookGroup: '',
    status: 'PENDING',
    adminFirebaseUid: COMM_ADMIN_2_UID,
    description: 'Community volunteers from Sonagazi committed to emergency blood supply.',
  },
];

const MEMBER_SEEDS = [
  { name: 'Aminul Islam',    phone: '01911200001', email: 'aminul@seed.com',    blood: 'A+',  loc: 'Feni Sadar',   addr: 'South Ekrampur, Feni',       avail: true  },
  { name: 'Shahida Parvin',  phone: '01911200002', email: 'shahida@seed.com',   blood: 'B+',  loc: 'Feni Sadar',   addr: 'Sherpur, Feni',               avail: true  },
  { name: 'Mostak Ahmed',    phone: '01911200003', email: 'mostak@seed.com',    blood: 'O+',  loc: 'Chhagalnaiya', addr: 'Barura Bazar, Chhagalnaiya',   avail: false },
  { name: 'Lovely Akter',    phone: '01911200004', email: 'lovely@seed.com',    blood: 'AB-', loc: 'Sonagazi',     addr: 'Dharmapur, Sonagazi',          avail: true  },
  { name: 'Imran Hossain',   phone: '01911200005', email: 'imran@seed.com',     blood: 'A-',  loc: 'Daganbhuiyan', addr: 'Kasba, Daganbhuiyan',          avail: true  },
  { name: 'Tahmina Begum',   phone: '01911200006', email: 'tahmina@seed.com',   blood: 'O-',  loc: 'Parshuram',    addr: 'Muhuriganj, Parshuram',        avail: true  },
  { name: 'Sabbir Khan',     phone: '01911200007', email: 'sabbir@seed.com',    blood: 'B-',  loc: 'Fulgazi',      addr: 'Darbar Hat, Fulgazi',          avail: false },
  { name: 'Nusrat Faria',    phone: '01911200008', email: 'nusrat@seed.com',    blood: 'AB+', loc: 'Feni Sadar',   addr: 'College Road, Feni',           avail: true  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI, { bufferCommands: false });
  console.log('✅ Connected\n');

  // --- Clean up previous seed data ---
  console.log('🗑  Removing previous seed data...');
  const seedUids = USERS.map((u) => u.uid).concat([COMM_ADMIN_1_UID]);
  const seedEmails = COMMUNITIES.map((c) => c.email);

  await Promise.all([
    User.deleteMany({ firebaseUid: { $in: seedUids } }),
    Community.deleteMany({ email: { $in: seedEmails } }),
    // Members and donations linked to seed communities will be deleted via communityId after communities are re-seeded
  ]);
  console.log('✅ Clean\n');

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log('👤 Seeding users...');
  const insertedUsers = await User.insertMany(
    USERS.map((u) => ({
      firebaseUid: u.uid,
      email: `${u.uid.toLowerCase()}@seed.fenibloodline.com`,
      fullName: u.name,
      phoneNumber: u.phone,
      bloodGroup: u.blood,
      location: u.loc,
      homeAddress: u.addr,
      profileImageUrl: avatar(u.name),
      isAvailableToDonate: true,
      isProfileComplete: true,
      donationCount: 0,
    })),
  );
  console.log(`   ✅ ${insertedUsers.length} users inserted`);

  // ── 2. Communities ────────────────────────────────────────────────────────
  console.log('🏘  Seeding communities...');
  const insertedComms = await Community.insertMany(
    COMMUNITIES.map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      logoUrl: c.logoUrl,
      website: c.website || undefined,
      facebookPage: c.facebookPage || undefined,
      facebookGroup: c.facebookGroup || undefined,
      status: c.status,
      adminFirebaseUid: c.adminFirebaseUid || undefined,
      description: c.description,
    })),
  );
  const approvedCommunity = insertedComms[0]; // Feni Blood Warriors
  const approvedCommId = approvedCommunity._id as Types.ObjectId;
  console.log(`   ✅ ${insertedComms.length} communities inserted`);

  // Clean up stale members/donations for these communities
  await CommunityMember.deleteMany({ communityId: approvedCommId });
  await DonationRecord.deleteMany({
    $or: [
      { communityId: approvedCommId },
      { donorFirebaseUid: { $in: seedUids } },
    ],
  });
  await BloodRequest.deleteMany({ contactNumber: { $in: ['01811100101', '01811100102', '01811100103', '01811100104', '01811100105', '01811100106'] } });

  // ── 3. Community Members ──────────────────────────────────────────────────
  console.log('👥 Seeding community members...');
  const insertedMembers = await CommunityMember.insertMany(
    MEMBER_SEEDS.map((m) => ({
      communityId: approvedCommId,
      fullName: m.name,
      bloodGroup: m.blood,
      phone: m.phone,
      email: m.email,
      location: m.loc,
      homeAddress: m.addr,
      profileImageUrl: avatar(m.name),
      isAvailableToDonate: m.avail,
    })),
  );
  console.log(`   ✅ ${insertedMembers.length} community members inserted`);

  // ── 4. Donation Records ───────────────────────────────────────────────────
  console.log('🩸 Seeding donation records...');

  const donationData = [
    // Community donations
    {
      communityId: approvedCommId,
      donorFirebaseUid: null,
      donorName: 'Aminul Islam',
      donorBloodGroup: 'A+',
      donorPhone: '01911200001',
      donorProfileImageUrl: avatar('Aminul Islam'),
      patientName: 'Hasan Mia',
      patientPhone: '01611300001',
      hospitalName: 'Feni General Hospital',
      location: 'Feni Sadar',
      address: 'Hospital Road, Feni Sadar',
      donatedAt: hoursAgo(3),
      notes: 'Emergency surgery — donated 2 bags',
    },
    {
      communityId: approvedCommId,
      donorFirebaseUid: null,
      donorName: 'Shahida Parvin',
      donorBloodGroup: 'B+',
      donorPhone: '01911200002',
      donorProfileImageUrl: avatar('Shahida Parvin'),
      patientName: 'Rina Akter',
      patientPhone: '01611300002',
      hospitalName: 'Feni Adhunik Sadar Hospital',
      location: 'Feni Sadar',
      address: 'Trunk Road, Feni',
      donatedAt: daysAgo(1),
      notes: 'Post-delivery blood loss',
    },
    {
      communityId: approvedCommId,
      donorFirebaseUid: null,
      donorName: 'Lovely Akter',
      donorBloodGroup: 'AB-',
      donorPhone: '01911200004',
      donorProfileImageUrl: avatar('Lovely Akter'),
      patientName: 'Kamal Uddin',
      patientPhone: '01611300003',
      hospitalName: 'Sonagazi Upazila Health Complex',
      location: 'Sonagazi',
      address: 'Sonagazi Sadar, Feni',
      donatedAt: daysAgo(2),
    },
    {
      communityId: approvedCommId,
      donorFirebaseUid: null,
      donorName: 'Imran Hossain',
      donorBloodGroup: 'A-',
      donorPhone: '01911200005',
      donorProfileImageUrl: avatar('Imran Hossain'),
      patientName: 'Shiuli Begum',
      patientPhone: '01611300004',
      hospitalName: 'Daganbhuiyan Upazila Health Complex',
      location: 'Daganbhuiyan',
      address: 'Daganbhuiyan Sadar',
      donatedAt: daysAgo(3),
    },
    {
      communityId: approvedCommId,
      donorFirebaseUid: null,
      donorName: 'Tahmina Begum',
      donorBloodGroup: 'O-',
      donorPhone: '01911200006',
      donorProfileImageUrl: avatar('Tahmina Begum'),
      patientName: 'Firoz Khan',
      patientPhone: '01611300005',
      hospitalName: 'Parshuram Upazila Health Complex',
      location: 'Parshuram',
      address: 'Parshuram Sadar',
      donatedAt: daysAgo(5),
    },
    // Personal (non-community) donations
    {
      communityId: null,
      donorFirebaseUid: 'SEED_USER_001',
      donorName: 'Arif Hossain',
      donorBloodGroup: 'A+',
      donorPhone: '01711000001',
      donorProfileImageUrl: avatar('Arif Hossain'),
      patientName: 'Nasim Ahmed',
      patientPhone: '01611300006',
      hospitalName: 'Feni General Hospital',
      location: 'Feni Sadar',
      address: 'Hospital Road, Feni Sadar',
      donatedAt: daysAgo(4),
      notes: 'Helped a neighbour in need',
    },
    {
      communityId: null,
      donorFirebaseUid: 'SEED_USER_003',
      donorName: 'Karim Ahmed',
      donorBloodGroup: 'O+',
      donorPhone: '01711000003',
      donorProfileImageUrl: avatar('Karim Ahmed'),
      patientName: 'Ruma Begum',
      patientPhone: '01611300007',
      hospitalName: 'Chhagalnaiya Upazila Hospital',
      location: 'Chhagalnaiya',
      address: 'Chhagalnaiya Sadar',
      donatedAt: daysAgo(6),
    },
    {
      communityId: null,
      donorFirebaseUid: 'SEED_USER_005',
      donorName: 'Rakib Mia',
      donorBloodGroup: 'A-',
      donorPhone: '01711000005',
      donorProfileImageUrl: avatar('Rakib Mia'),
      patientName: 'Jahanara Khatun',
      patientPhone: '01611300008',
      hospitalName: 'Parshuram Upazila Health Complex',
      location: 'Parshuram',
      address: 'Mirsarai Para, Parshuram',
      donatedAt: daysAgo(8),
    },
  ];

  const insertedDonations = await DonationRecord.insertMany(donationData);
  console.log(`   ✅ ${insertedDonations.length} donation records inserted`);

  // ── 5. Blood Requests ─────────────────────────────────────────────────────
  console.log('🚨 Seeding blood requests...');

  const bloodRequestData = [
    {
      patientName: 'Jamal Uddin',
      hospitalName: 'Feni General Hospital',
      bloodGroup: 'O+',
      urgency: 'URGENT',
      address: 'Hospital Road, Feni Sadar',
      contactNumber: '01811100101',
      unitsNeeded: 3,
      location: 'Feni Sadar',
      status: 'OPEN',
      notes: 'Accident victim — needs O+ immediately',
      communityId: approvedCommId,
      communityName: 'Feni Blood Warriors',
      communityLogoUrl: COMMUNITIES[0].logoUrl,
    },
    {
      patientName: 'Rohima Khatun',
      hospitalName: 'Feni Adhunik Sadar Hospital',
      bloodGroup: 'A+',
      urgency: 'HIGH',
      address: 'Trunk Road, Feni',
      contactNumber: '01811100102',
      unitsNeeded: 2,
      location: 'Feni Sadar',
      status: 'OPEN',
      notes: 'Scheduled surgery on Wednesday',
    },
    {
      patientName: 'Belal Hossain',
      hospitalName: 'Sonagazi Upazila Health Complex',
      bloodGroup: 'B-',
      urgency: 'URGENT',
      address: 'Sonagazi Sadar, Feni',
      contactNumber: '01811100103',
      unitsNeeded: 1,
      location: 'Sonagazi',
      status: 'OPEN',
    },
    {
      patientName: 'Shirin Akter',
      hospitalName: 'Chhagalnaiya Upazila Hospital',
      bloodGroup: 'AB+',
      urgency: 'NEEDED',
      address: 'Chhagalnaiya Sadar',
      contactNumber: '01811100104',
      unitsNeeded: 2,
      location: 'Chhagalnaiya',
      status: 'OPEN',
      notes: 'Thalassemia patient — regular transfusion needed',
    },
    {
      patientName: 'Mizanur Rahman',
      hospitalName: 'Daganbhuiyan Upazila Health Complex',
      bloodGroup: 'O-',
      urgency: 'URGENT',
      address: 'Daganbhuiyan Sadar',
      contactNumber: '01811100105',
      unitsNeeded: 4,
      location: 'Daganbhuiyan',
      status: 'OPEN',
    },
    {
      patientName: 'Kohinoor Begum',
      hospitalName: 'Parshuram Upazila Health Complex',
      bloodGroup: 'A-',
      urgency: 'HIGH',
      address: 'Parshuram Sadar',
      contactNumber: '01811100106',
      unitsNeeded: 1,
      location: 'Parshuram',
      status: 'FULFILLED',
      notes: 'Need fulfilled — thanks to all donors',
    },
  ];

  const insertedRequests = await BloodRequest.insertMany(bloodRequestData);
  console.log(`   ✅ ${insertedRequests.length} blood requests inserted`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════');
  console.log('🎉 Seed complete!');
  console.log('════════════════════════════════════════');
  console.log(`👤  Users:             ${insertedUsers.length}`);
  console.log(`🏘   Communities:       ${insertedComms.length}  (1 APPROVED, 1 PENDING)`);
  console.log(`👥  Community members: ${insertedMembers.length}  (under "Feni Blood Warriors")`);
  console.log(`🩸  Donation records:  ${insertedDonations.length}  (5 community + 3 personal)`);
  console.log(`🚨  Blood requests:    ${insertedRequests.length}  (5 OPEN, 1 FULFILLED)`);
  console.log('════════════════════════════════════════');
  console.log('\n📌 NOTE: The seed users use fake Firebase UIDs (SEED_USER_xxx).');
  console.log('   To log in as a community admin, set COMM_ADMIN_1_UID in seed.ts');
  console.log('   to your real Firebase UID and re-run the seed.\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected. Done.\n');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
