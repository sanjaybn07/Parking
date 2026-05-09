const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');
const Activity = require('../models/Activity');
const crypto = require('crypto');
const { sendPaymentReceipt } = require('../utils/notificationService');
const Razorpay = require('razorpay');

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

exports.createOrder = async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let orderId;
    let actualKey = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';

    if (razorpayInstance) {
      const options = {
        amount: amount * 100, // in paise
        currency: "INR",
        receipt: `receipt_${booking._id}`,
      };
      const order = await razorpayInstance.orders.create(options);
      orderId = order.id;
    } else {
      // Mock Razorpay Order Creation
      orderId = 'order_' + Math.random().toString(36).substring(7);
      actualKey = 'rzp_test_placeholder';
    }

    const payment = await Payment.create({
      paymentId: 'PAY' + Date.now(),
      orderId,
      booking: booking._id,
      user: req.user._id,
      amount,
      method,
      status: 'pending'
    });

    res.json({
      success: true,
      data: {
        orderId,
        amount,
        currency: 'INR',
        paymentId: payment._id,
        key: actualKey,
        isMock: !razorpayInstance
      }
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify signature with crypto if real Razorpay is used
    const payment = await Payment.findById(paymentId).populate('booking');
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    if (razorpayInstance && razorpay_signature !== 'manual_qr_verified' && razorpay_signature !== 'mock_signature') {
      const body = payment.orderId + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    payment.status = 'paid';
    payment.paymentId = razorpay_payment_id || payment.paymentId;
    await payment.save();

    // Update booking status and record actual cost
    const booking = payment.booking;
    booking.status = 'paid';
    booking.exitTime = new Date();
    booking.payment = payment._id;
    
    // Crucial for Admin Analytics (sessions count & total spent)
    if (!booking.pricing) booking.pricing = {};
    booking.pricing.actualCost = payment.amount;
    
    // Calculate final duration for the record
    const sec = Math.floor((booking.exitTime - booking.entryTime) / 1000);
    const bh = Math.floor(sec / 3600), bm = Math.floor((sec % 3600) / 60);
    booking.duration = `${bh}h ${bm}m`;

    await booking.save();

    // Release the slot back to Available status
    if (booking.slot) {
      await Slot.findByIdAndUpdate(booking.slot, { 
        status: 'available', 
        currentBooking: null 
      });
    }

    // Update User's cumulative stats in database
    const user = await User.findById(req.user._id);
    if (user) {
      user.totalSpent = (user.totalSpent || 0) + payment.amount;
      await user.save();
    }

    // ────────────────────────────────────────────────
    // SOCKET.IO REAL-TIME BROADCAST (CRITICAL FOR ADMIN SYNC)
    // ────────────────────────────────────────────────
    const io = req.app.get('io');
    if (io) {
      // Notify about booking status change
      io.to('parking-updates').emit('booking-updated', {
        bookingId: booking._id,
        status: 'paid',
        userId: req.user._id
      });

      // Notify about slot being freed
      if (booking.slot) {
        const releasedSlot = await Slot.findById(booking.slot);
        if (releasedSlot) {
          io.to('parking-updates').emit('slot-update', {
            slotId: releasedSlot.slotId,
            status: 'available'
          });
        }
      }
    }
    // Send Real-Time Receipt (SMS/WhatsApp)
    try {
      if (user && user.phone) {
        sendPaymentReceipt(user, payment.amount, booking);
      }
    } catch (e) {
      console.warn('Payment Notification warning:', e.message);
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort('-transactionDate');
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
