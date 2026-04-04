const express = require('express');
const router = express.Router();
const {
  getBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber
} = require('../controllers/barberController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBarbers)
  .post(protect, admin, createBarber);

router.route('/:id')
  .get(getBarberById)
  .put(protect, admin, updateBarber)
  .delete(protect, admin, deleteBarber);

module.exports = router;
