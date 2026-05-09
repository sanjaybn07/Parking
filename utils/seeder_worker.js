const mongoose = require('mongoose');
const User = require('../models/User');
const Slot = require('../models/Slot');
const Settings = require('../models/Settings');

const seedData = async (force = false) => {
  try {
    const slotCount = await Slot.countDocuments();
    if (slotCount > 0 && !force) {
      console.log('✅ Database already contains slots. Skipping seeding.');
      return;
    }

    console.log(force ? '⚠️ Force resetting data...' : '✅ Starting Data Seeding...');

    // 1. Clear existing data only if forcing or if slots are missing (though if count is 0, deleteMany is harmless)
    if (force || slotCount === 0) {
      await User.deleteMany({ role: 'admin' });
      await Slot.deleteMany({});
      await Settings.deleteMany({});
    }
// ... rest of the code ...

    // 2. Create Admin User & Default User
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@garudamallparking.com',
      phone: '7019595194',
      password: process.env.ADMIN_PASSWORD || '12345',
      role: 'admin'
    });
    console.log('👤 Admin user created');

    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: '1234',
      role: 'user',
      vehicles: [{ number: 'KA-01-BK-9988', type: '4W' }]
    });
    console.log('👤 Test user created (9876543210 / 1234)');

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
            charging: (zone === 'C' && i <= 2) || (zone === 'A' && i <= 2), 
            accessible: i === 1
          }
        });
      }
    });

    await Slot.insertMany(slots);
    console.log(`🅿️  ${slots.length} slots created`);

    console.log('🚀 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

module.exports = seedData;
