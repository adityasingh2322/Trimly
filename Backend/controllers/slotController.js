const asyncHandler = require('express-async-handler');
const Slot = require('../models/Slot');
const Barber = require('../models/Barber');
const Appointment = require('../models/Appointment');

// @desc    Create a slot
// @route   POST /api/slots
// @access  Private/Admin
const createSlot = asyncHandler(async (req, res) => {
  const { barberId, date, time } = req.body;

  const barberExists = await Barber.findById(barberId);
  if (!barberExists) {
    res.status(404);
    throw new Error('Barber not found');
  }

  // Parse date properly to only store date portion for easier querying
  const slotDate = new Date(date);
  slotDate.setHours(0, 0, 0, 0);

  const slotExists = await Slot.findOne({ barber: barberId, date: slotDate, time });
  if (slotExists) {
    res.status(400);
    throw new Error('Slot already exists for this barber at this time');
  }

  const slot = await Slot.create({
    barber: barberId,
    date: slotDate,
    time
  });

  res.status(201).json(slot);
});

// @desc    Get slots by date
// @route   GET /api/slots
// @access  Public
const getSlotsByDate = asyncHandler(async (req, res) => {
  const { date, barberId } = req.query;

  let query = {};
  
  if (date) {
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    query.date = queryDate;
  }
  
  if (barberId) {
    query.barber = barberId;
  }

  const slots = await Slot.find(query).populate('barber', 'name specialty');

  // If both date and barberId are provided, generate standard slots
  if (date && barberId) {
    const standardTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
    
    const resultSlots = standardTimes.map(time => {
      const existing = slots.find(s => s.time === time);
      if (existing) {
        return existing;
      }
      return {
        _id: `virtual-${time}`, // string instead of ObjectId for standard react key
        time,
        isBooked: false,
        isVirtual: true,
        barber: barberId,
        date: query.date
      };
    });
    return res.json(resultSlots);
  }

  res.json(slots);
});

// @desc    Delete a slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
const deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);

  if (slot) {
    if (slot.isBooked) {
      res.status(400);
      throw new Error('Cannot delete a booked slot');
    }
    await Slot.deleteOne({ _id: slot._id });
    res.json({ message: 'Slot removed' });
  } else {
    res.status(404);
    throw new Error('Slot not found');
  }
});

// @desc    Toggle slot availability status for admin
// @route   POST /api/slots/toggle-availability
// @access  Private/Admin
const toggleSlotAvailability = asyncHandler(async (req, res) => {
  const { barberId, date, time } = req.body;

  const slotDate = new Date(date);
  slotDate.setHours(0, 0, 0, 0);

  let slot = await Slot.findOne({ barber: barberId, date: slotDate, time });

  if (!slot) {
    // If it doesn't exist (virtual slot), create it and mark as booked (unavailable)
    slot = await Slot.create({
      barber: barberId,
      date: slotDate,
      time,
      isBooked: true
    });
    return res.status(201).json({ message: 'Slot marked as unavailable', slot });
  }

  // If it exists, toggle it
  if (slot.isBooked) {
    // Validate if a real customer holds this slot via Appointment
    const appointment = await Appointment.findOne({ slot: slot._id, status: { $ne: 'Cancelled' } });
    if (appointment) {
      res.status(400);
      throw new Error('This slot is already booked by an actual customer and cannot be safely changed.');
    }
    
    // Free it up. Deleting it makes it seamlessly virtual and 'available' again.
    await Slot.deleteOne({ _id: slot._id });
    return res.json({ message: 'Slot is now available again', slot: { ...slot._doc, isBooked: false, isVirtual: true } });
  } else {
    // If it exists but is free, just mark it booked
    slot.isBooked = true;
    await slot.save();
    return res.json({ message: 'Slot marked as unavailable', slot });
  }
});

module.exports = {
  createSlot,
  getSlotsByDate,
  deleteSlot,
  toggleSlotAvailability
};
