const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone, vehicleNumber, vehicleType } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.phone = phone || user.phone;

    // Update primary vehicle if provided
    if (vehicleNumber && vehicleType) {
      if (user.vehicles && user.vehicles.length > 0) {
        user.vehicles[0].number = vehicleNumber;
        user.vehicles[0].type = vehicleType;
      } else {
        user.vehicles.push({ number: vehicleNumber, type: vehicleType, isPrimary: true });
      }
    }

    await user.save();

    // Notify admin dashboard of profile changes
    const io = req.app.get('io');
    if (io) io.emit('profile-updated', { userId: user._id });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addVehicle = async (req, res) => {
  try {
    const { number, type } = req.body;
    const user = await User.findById(req.user._id);
    user.vehicles.push({ number, type });
    await user.save();
    res.json({ success: true, data: user.vehicles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    user.vehicles = user.vehicles.filter(v => v._id.toString() !== id);
    await user.save();
    res.json({ success: true, data: user.vehicles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
