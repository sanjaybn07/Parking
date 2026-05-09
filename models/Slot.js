const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotId: { type: String, required: true, unique: true }, // e.g., 'A1', 'C10'
  zone: { type: String, enum: ['A', 'B', 'C', 'D', 'E'], required: true },
  type: { type: String, enum: ['2W', '4W'], required: true },
  status: { type: String, enum: ['available', 'occupied', 'blocked'], default: 'available' },
  metadata: {
    charging: { type: Boolean, default: false },
    covered: { type: Boolean, default: true },
    accessible: { type: Boolean, default: false }
  },
  currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  lastStatusUpdate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Slot', slotSchema);
