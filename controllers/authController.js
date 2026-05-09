const User = require('../models/User');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_fallback_secret', {
    expiresIn: '30d'
  });
};

// Helper for consistent user data with analytics
async function getUserWithStats(id, res, additionalData = {}) {
  const user = await User.findById(id).select('-password');
  if (!user) return null;

  const stats = await Booking.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        sessionsCount: { $sum: 1 },
        totalSpent: { $sum: { $ifNull: ['$pricing.actualCost', 0] } }
      }
    }
  ]);

  return {
    ...user.toObject(),
    sessionsCount: stats[0]?.sessionsCount || 0,
    totalSpent: stats[0]?.totalSpent || 0,
    ...additionalData
  };
}

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, vehicles } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) return res.status(400).json({ message: 'User with this email/phone already exists' });

    const user = await User.create({ name, email, phone, password, vehicles });
    const data = await getUserWithStats(user._id, res, { token: generateToken(user._id) });
    res.status(201).json({ success: true, data });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = email || phone;
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });

    if (user && (await user.comparePassword(password))) {
      const data = await getUserWithStats(user._id, res, { token: generateToken(user._id) });
      res.json({ success: true, data });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getMe = async (req, res) => {
  try {
    const data = await getUserWithStats(req.user._id, res);
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.logoutUser = async (req, res) => {
  // Client-side handles token destruction, but we can log activity
  res.json({ success: true, message: 'Logged out' });
};
