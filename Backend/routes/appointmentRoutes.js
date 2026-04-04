const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getAppointments,
  cancelAppointment,
  completeAppointment
} = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, bookAppointment)
  .get(protect, admin, getAppointments);

router.route('/myappointments').get(protect, getMyAppointments);

router.route('/:id/cancel').put(protect, cancelAppointment);
router.route('/:id/complete').put(protect, admin, completeAppointment);

module.exports = router;
