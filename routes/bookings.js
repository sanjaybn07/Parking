const express = require('express');
const router = express.Router();
const { 
  createBooking, getMyBookings, getActiveBooking, 
  completeBooking, cancelBooking, verifyBookingByCode 
} = require('../controllers/bookingController');
const { auth } = require('../middleware/authMiddleware');

router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getMyBookings);
router.get('/active', auth, getActiveBooking);

router.put('/:id/complete', auth, completeBooking);
router.put('/:id/cancel', auth, cancelBooking);

module.exports = router;
