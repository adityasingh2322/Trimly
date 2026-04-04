const asyncHandler = require('express-async-handler');
const Barber = require('../models/Barber');

// @desc    Fetch all barbers
// @route   GET /api/barbers
// @access  Public
const getBarbers = asyncHandler(async (req, res) => {
  const barbers = await Barber.find({});
  res.json(barbers);
});

// @desc    Fetch single barber
// @route   GET /api/barbers/:id
// @access  Public
const getBarberById = asyncHandler(async (req, res) => {
  const barber = await Barber.findById(req.params.id);

  if (barber) {
    res.json(barber);
  } else {
    res.status(404);
    throw new Error('Barber not found');
  }
});

// @desc    Create a barber
// @route   POST /api/barbers
// @access  Private/Admin
const createBarber = asyncHandler(async (req, res) => {
  const { name, specialty, experience, image } = req.body;

  const barber = new Barber({
    name,
    specialty,
    experience,
    image
  });

  const createdBarber = await barber.save();
  res.status(201).json(createdBarber);
});

// @desc    Update a barber
// @route   PUT /api/barbers/:id
// @access  Private/Admin
const updateBarber = asyncHandler(async (req, res) => {
  const { name, specialty, experience, image } = req.body;

  const barber = await Barber.findById(req.params.id);

  if (barber) {
    barber.name = name || barber.name;
    barber.specialty = specialty || barber.specialty;
    barber.experience = experience || barber.experience;
    barber.image = image || barber.image;

    const updatedBarber = await barber.save();
    res.json(updatedBarber);
  } else {
    res.status(404);
    throw new Error('Barber not found');
  }
});

// @desc    Delete a barber
// @route   DELETE /api/barbers/:id
// @access  Private/Admin
const deleteBarber = asyncHandler(async (req, res) => {
  const barber = await Barber.findById(req.params.id);

  if (barber) {
    await Barber.deleteOne({ _id: barber._id });
    res.json({ message: 'Barber removed' });
  } else {
    res.status(404);
    throw new Error('Barber not found');
  }
});

module.exports = {
  getBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber
};
