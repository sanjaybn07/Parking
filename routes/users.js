const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, addVehicle, removeVehicle } = require('../controllers/userController');
const { auth } = require('../middleware/authMiddleware');

router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.post('/vehicles', auth, addVehicle);
router.delete('/vehicles/:id', auth, removeVehicle);

module.exports = router;
