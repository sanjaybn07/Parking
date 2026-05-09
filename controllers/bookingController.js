const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Settings = require('../models/Settings');
const Activity = require('../models/Activity');
const User = require('../models/User'); // Import User model
const { sendBookingSms } = require('../utils/notificationService');

exports.createBooking = async (req, res) => {
  try {
    const { slotId, vehicleNumber, vehicleType, expectedDuration } = req.body;
    
    // Find slot
    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.status !== 'available') return res.status(400).json({ message: 'Slot is already occupied or blocked' });

    // Find pricing
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    const hourlyRate = vehicleType === '4W' ? settings.pricing.rate4W : settings.pricing.rate2W;

    const bookingNumber = 'BK' + Date.now().toString().slice(-8);

    const booking = await Booking.create({
      bookingNumber,
      user: req.user._id,
      slot: slot._id,
      vehicleNumber,
      vehicleType,
      expectedDuration,
      pricing: {
        hourlyRate,
        estimatedCost: hourlyRate * expectedDuration
      }
    });

    // Update slot status
    slot.status = 'occupied';
    slot.currentBooking = booking._id;
    await slot.save();

    // Log Activity
    await Activity.create({
      user: req.user._id,
      action: 'New Booking',
      details: `Slot ${slot.slotId} occupied for ${vehicleNumber}`
    });

    // Notify others via Socket.IO
    const io = req.app.get('io');
    io.to('parking-updates').emit('slot-update', {
      slotId: slot.slotId,
      status: 'occupied',
      bookingId: booking._id
    });

    // Send Real-Time Notifications (Mobile)
    try {
      const user = await User.findById(req.user._id);
      if (user && user.phone) {
        // Run in background so response isn't delayed
        sendBookingSms(user, booking, slot);
      }
    } catch (e) {
      console.warn('Booking Notification warning:', e.message);
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('slot').sort('-createdAt');
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      user: req.user._id, 
      status: { $in: ['active', 'pending_payment', 'pending'] } 
    }).populate('slot');
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('slot');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'active') return res.status(400).json({ message: 'Booking is already closed' });

    booking.exitTime = new Date();
    const durationHrs = Math.max(1, Math.ceil((booking.exitTime - booking.entryTime) / (1000 * 60 * 60)));
    booking.pricing.actualCost = durationHrs * booking.pricing.hourlyRate;
    booking.status = 'pending_payment';
    await booking.save();

    // Notify Sockets
    const io = req.app.get('io');
    io.to('parking-updates').emit('booking-updated', {
      bookingId: booking._id,
      status: 'pending_payment'
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('slot');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'cancelled';
    await booking.save();

    // Release slot
    const slot = booking.slot;
    slot.status = 'available';
    slot.currentBooking = null;
    await slot.save();

    // Notify others
    const io = req.app.get('io');
    io.to('parking-updates').emit('booking-updated', {
      bookingId: booking._id,
      status: 'cancelled'
    });
    io.to('parking-updates').emit('slot-update', {
      slotId: slot.slotId,
      status: 'available'
    });

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

