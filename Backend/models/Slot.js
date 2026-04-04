const mongoose = require('mongoose');

const slotSchema = mongoose.Schema({
  barber: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Barber' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, required: true, default: false }
}, {
  timestamps: true
});

// Create compound index for date, time, and barber to prevent duplicate slots
slotSchema.index({ barber: 1, date: 1, time: 1 }, { unique: true });

const Slot = mongoose.model('Slot', slotSchema);
module.exports = Slot;
