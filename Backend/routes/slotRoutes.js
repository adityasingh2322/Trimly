const express = require('express');
const router = express.Router();
const {
  createSlot,
  getSlotsByDate,
  deleteSlot,
  toggleSlotAvailability
} = require('../controllers/slotController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createSlot)
  .get(getSlotsByDate);

router.route('/toggle-availability').post(protect, admin, toggleSlotAvailability);

router.route('/:id').delete(protect, admin, deleteSlot);

module.exports = router;
