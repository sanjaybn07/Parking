const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true }, // Razorpay payment ID or custom
  orderId: { type: String }, // Razorpay order ID
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['UPI', 'Card', 'Cash', 'Net Banking', 'qr', 'gpay', 'phonepe', 'paytm', 'razorpay'], default: 'UPI' },
  status: { type: String, enum: ['paid', 'pending', 'failed', 'refunded'], default: 'pending' },
  receiptUrl: { type: String },
  transactionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
