const mongoose = require('mongoose');

const barberSchema = mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String },
  experience: { type: String },
  image: { type: String, default: '/images/default-barber.png' }
}, {
  timestamps: true
});

const Barber = mongoose.model('Barber', barberSchema);
module.exports = Barber;
