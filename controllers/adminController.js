const User = require('../models/User');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Activity = require('../models/Activity');
const Settings = require('../models/Settings');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Revenue Aggregations
    const revStats = await Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          today: { $sum: { $cond: [{ $gte: ['$transactionDate', today] }, '$amount', 0] } },
          weekly: { $sum: { $cond: [{ $gte: ['$transactionDate', weekAgo] }, '$amount', 0] } },
          monthly: { $sum: { $cond: [{ $gte: ['$transactionDate', monthAgo] }, '$amount', 0] } },
          allTime: { $sum: '$amount' }
        }
      }
    ]);

    const sessionsToday = await Booking.countDocuments({ createdAt: { $gte: today } });
    const freeSlots = await Slot.countDocuments({ status: 'available' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    res.json({
      success: true,
      data: {
        revenue: revStats[0] || { today: 0, weekly: 0, monthly: 0, allTime: 0 },
        activeSessionsNow: await Booking.countDocuments({ status: 'active' }),
        sessionsToday,
        availableSlots: freeSlots,
        totalUsers: totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'user',
          as: 'history'
        }
      },
      {
        $project: {
          name: 1, phone: 1, email: 1, vehicles: 1, createdAt: 1,
          sessionsCount: { $size: '$history' },
          totalSpent: { $sum: { $ifNull: ['$history.pricing.actualCost', 0] } }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user slot').sort('-createdAt');
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { pricing, notifications, password } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (pricing) settings.pricing = pricing;
    if (notifications) settings.notifications = notifications;
    settings.updatedBy = req.user._id;
    settings.updatedAt = new Date();
    await settings.save();

    // If password provided, update admin password
    if (password) {
      const admin = await User.findById(req.user._id);
      admin.password = password;
      await admin.save();
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetAllSlots = async (req, res) => {
  try {
    await Slot.updateMany({}, { status: 'available', currentBooking: null });
    
    // Notify via Sockets
    const io = req.app.get('io');
    io.to('parking-updates').emit('slots-reset');

    res.json({ success: true, message: 'All slots reset to available' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await Activity.find().populate('user', 'name').sort('-timestamp').limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearAllLogs = async (req, res) => {
  try {
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Activity.deleteMany({});
    
    // Also reset all slots to available
    await Slot.updateMany({}, { status: 'available', currentBooking: null });

    res.json({ success: true, message: 'All database logs and sessions cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // If active, release slot
    if (booking.status === 'active' && booking.slot) {
      await Slot.findByIdAndUpdate(booking.slot, { status: 'available', currentBooking: null });
    }

    await Booking.findByIdAndDelete(id);
    res.json({ success: true, message: 'Booking record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
