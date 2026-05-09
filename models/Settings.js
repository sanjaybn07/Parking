const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  pricing: {
    rate2W: { type: Number, default: 10 },
    rate4W: { type: Number, default: 30 }
  },
  notifications: {
    smsEnabled: { type: Boolean, default: false },
    emailEnabled: { type: Boolean, default: true },
    whatsappEnabled: { type: Boolean, default: false }
  },
  systemName: { type: String, default: 'Garuda Mall Parking Management System' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
