const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, getAllUsers, getAllBookings, getSettings, 
  updateSettings, resetAllSlots, getActivityLogs, deleteUser, 
  clearAllLogs, deleteBooking 
} = require('../controllers/adminController');
const { auth, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', auth, admin, getDashboardStats);
router.get('/users', auth, admin, getAllUsers);
router.delete('/users/:id', auth, admin, deleteUser);
router.get('/bookings', auth, admin, getAllBookings);
router.delete('/bookings/:id', auth, admin, deleteBooking);


router.get('/settings', getSettings);
router.put('/settings', auth, admin, updateSettings);
router.post('/slots/reset', auth, admin, resetAllSlots);
router.delete('/clear-logs', auth, admin, clearAllLogs);
router.get('/activity', auth, admin, getActivityLogs);

module.exports = router;
