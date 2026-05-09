const Slot = require('../models/Slot');
const Activity = require('../models/Activity');

exports.getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find();
    res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const query = { status: 'available' };
    if (req.query.vehicleType) {
      query.type = req.query.vehicleType;
    }
    const slots = await Slot.find(query);
    res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSlotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const slot = await Slot.findById(id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    slot.status = status;
    slot.lastStatusUpdate = new Date();
    await slot.save();

    // Emit live update via Socket.IO
    const io = req.app.get('io');
    io.to('parking-updates').emit('slot-update', {
      slotId: slot.slotId,
      status: slot.status
    });

    res.json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleBlockSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findById(id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    slot.status = slot.status === 'blocked' ? 'available' : 'blocked';
    await slot.save();

    const io = req.app.get('io');
    io.to('parking-updates').emit('slot-update', {
      slotId: slot.slotId,
      status: slot.status
    });

    res.json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSlotStats = async (req, res) => {
  try {
    const total = await Slot.countDocuments();
    const available = await Slot.countDocuments({ status: 'available' });
    const occupied = await Slot.countDocuments({ status: 'occupied' });
    const blocked = await Slot.countDocuments({ status: 'blocked' });

    res.json({
      success: true,
      data: { total, available, occupied, blocked }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
