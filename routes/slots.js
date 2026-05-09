const express = require('express');
const router = express.Router();
const { getAllSlots, getAvailableSlots, updateSlotStatus, toggleBlockSlot, getSlotStats } = require('../controllers/slotController');
const { auth, admin } = require('../middleware/authMiddleware');

router.get('/', getAllSlots);
router.get('/available', getAvailableSlots);
router.get('/stats/overview', auth, admin, getSlotStats);
router.put('/:id', updateSlotStatus);
router.put('/:id/toggle-block', auth, admin, toggleBlockSlot);

module.exports = router;
