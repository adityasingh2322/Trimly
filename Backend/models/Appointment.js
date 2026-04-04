const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  barber: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Barber' },
  slot: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Slot' },
  status: { type: String, enum: ['Booked', 'Completed', 'Cancelled'], default: 'Booked' },
  appointmentCode: { type: String, required: false }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
