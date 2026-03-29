require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');

const MONGO_URI = process.env.MONGO_URI;

async function seedSampleCandidates() {
  if (!MONGO_URI) {
    console.error('Set MONGO_URI in BACKEND/.env before seeding.');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  if (await Candidate.exists({})) {
    console.log('Candidates already exist, skipping seed (avoid dupes in shared DB).');
    await mongoose.disconnect();
    return;
  }

  const samples = [
    {
      firstName: 'Riya',
      lastName: 'Sharma',
      email: 'riya.sharma@example.com',
      dob: new Date('1996-04-12'),
      isSameAddress: true,
      residentialAddress: { street1: '12 MG Road', street2: 'Near City Mall' },
      permanentAddress: { street1: '12 MG Road', street2: 'Near City Mall' },
      documents: [
        {
          fileName: 'passport_scan',
          fileType: 'pdf',
          fileUrl: '/uploads/candidates/seed-placeholder-passport.pdf',
        },
        {
          fileName: 'profile_photo',
          fileType: 'image',
          fileUrl: '/uploads/candidates/seed-placeholder-photo.png',
        },
      ],
    },
    {
      firstName: 'Arjun',
      lastName: 'Mehta',
      email: 'arjun.mehta@example.com',
      dob: new Date('1993-11-02'),
      isSameAddress: false,
      residentialAddress: { street1: '45 Bandra West', street2: 'Sea View Apartments' },
      permanentAddress: { street1: 'Plot 3', street2: 'Indore — family home' },
      documents: [
        {
          fileName: 'degree_certificate',
          fileType: 'pdf',
          fileUrl: '/uploads/candidates/seed-placeholder-degree.pdf',
        },
        {
          fileName: 'id_card_front',
          fileType: 'image',
          fileUrl: '/uploads/candidates/seed-placeholder-id.jpg',
        },
        {
          fileName: 'address_proof',
          fileType: 'pdf',
          fileUrl: '/uploads/candidates/seed-placeholder-address.pdf',
        },
      ],
    },
  ];

  await Candidate.insertMany(samples);
  console.log(`Seeded ${samples.length} sample candidates.`);
  await mongoose.disconnect();
}

seedSampleCandidates().catch((err) => {
  console.error(err);
  process.exit(1);
});
