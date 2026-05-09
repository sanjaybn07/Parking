const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, required: true, unique: true }, // e.g. BK240410001
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String, enum: ['2W', '4W'], required: true },
  entryTime: { type: Date, default: Date.now },
  exitTime: { type: Date },
  expectedDuration: { type: Number }, // In hours
  pricing: {
    hourlyRate: { type: Number, required: true },
    estimatedCost: { type: Number },
    actualCost: { type: Number }
  },
  status: { type: String, enum: ['active', 'paid', 'cancelled', 'pending', 'pending_payment', 'completed'], default: 'active' },

  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
