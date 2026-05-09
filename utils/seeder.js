const mongoose = require('mongoose');
const User = require('../models/User');
const Slot = require('../models/Slot');
const Settings = require('../models/Settings');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/garuda-mall-parking';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // 1. Clear existing data
    await User.deleteMany({ role: 'admin' });
    await Slot.deleteMany({});
    await Settings.deleteMany({});

    // 2. Create Admin User
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@garudamallparking.com',
      phone: '7019595194',
      password: process.env.ADMIN_PASSWORD || '12345',
      role: 'admin'
    });
    console.log('👤 Admin user created');

    // 3. Create Settings
    await Settings.create({
      updatedBy: admin._id,
      pricing: { rate2W: 10, rate4W: 30 }
    });
    console.log('⚙️ Default settings created');

    // 4. Create 50 Slots (A-E)
    const ZONES = {
      A: { type: '2W', label: '2W', count: 10 },
      B: { type: '2W', label: '2W', count: 10 },
      C: { type: '4W', label: '4W', count: 10 },
      D: { type: '4W', label: '4W', count: 10 },
      E: { type: '4W', label: '4W', count: 10 }
    };

    const slots = [];
    Object.keys(ZONES).forEach(zone => {
      for (let i = 1; i <= ZONES[zone].count; i++) {
        slots.push({
          slotId: `${zone}${i}`,
          zone: zone,
          type: ZONES[zone].type,
          status: 'available',
          metadata: {
            covered: true,
            charging: zone === 'C' || zone === 'A', // Some slots with charging
            accessible: i === 1 // First slot in each zone accessible
          }
        });
      }
    });

    await Slot.insertMany(slots);
    console.log(`🅿️  ${slots.length} slots created`);

    console.log('🚀 Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
