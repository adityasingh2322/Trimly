const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
const bookAppointment = asyncHandler(async (req, res) => {
  const { slotId, barberId, date, time } = req.body;

  let slot;
  
  if (slotId && !slotId.startsWith('virtual-')) {
    slot = await Slot.findById(slotId);
  }

  if (!slot && barberId && date && time) {
    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    slot = await Slot.findOne({ barber: barberId, date: slotDate, time });

    if (!slot) {
      slot = await Slot.create({
        barber: barberId,
        date: slotDate,
        time,
        isBooked: false
      });
    }
  }

  if (!slot) {
    res.status(404);
    throw new Error('Slot not found and could not be created');
  }

  if (slot.isBooked) {
    res.status(400);
    throw new Error('Slot is already booked');
  }

  // Generate a random 4 digit code
  const appointmentCode = Math.floor(1000 + Math.random() * 9000).toString();

  // Create appointment
  const appointment = await Appointment.create({
    user: req.user._id,
    barber: slot.barber,
    slot: slot._id,
    appointmentCode
  });

  // Mark slot as booked
  slot.isBooked = true;
  await slot.save();

  // Populate info
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('barber', 'name specialty')
    .populate('slot', 'date time');

  // Send Email Notification
  const sendEmail = require('../utils/emailService');
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #Cfb53b; border-radius: 10px;">
      <h2 style="color: #Cfb53b; text-align: center;">Appointment Confirmed!</h2>
      <p>Hi <strong>${req.user.name}</strong>,</p>
      <p>Your premium grooming session has been successfully booked.</p>
      <div style="background-color: #111; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Professional:</strong> ${populatedAppointment.barber.name}</p>
        <p><strong>Date:</strong> ${new Date(populatedAppointment.slot.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${populatedAppointment.slot.time}</p>
        <div style="margin-top: 20px; text-align: center; border-top: 1px solid #444; padding-top: 15px;">
          <p style="color: #aaa; margin-bottom: 5px;">Your Check-in Code</p>
          <h1 style="color: #cfb53b; font-size: 36px; margin: 0; letter-spacing: 5px;">${appointment.appointmentCode}</h1>
        </div>
      </div>
      <p>We look forward to seeing you. Please arrive 5 minutes early and present your Check-in Code.</p>
      <br />
      <p>Best regards,<br/><strong>The Trimly Team</strong></p>
    </div>
  `;

  await sendEmail({
    email: req.user.email,
    subject: 'Trimly - Appointment Confirmation',
    html: emailHtml
  });

  res.status(201).json(populatedAppointment);
});

// @desc    Get logged in user appointments
// @route   GET /api/appointments/myappointments
// @access  Private
const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate('barber', 'name specialty image')
    .populate('slot', 'date time')
    .sort({ createdAt: -1 });
  
  res.json(appointments);
});

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private/Admin
const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({})
    .populate('user', 'name email')
    .populate('barber', 'name specialty')
    .populate('slot', 'date time')
    .sort({ createdAt: -1 });

  res.json(appointments);
});

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (appointment.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to cancel this appointment');
  }

  if (appointment.status === 'Cancelled') {
    res.status(400);
    throw new Error('Appointment is already cancelled');
  }

  appointment.status = 'Cancelled';
  await appointment.save();

  // Free up the slot
  const slot = await Slot.findById(appointment.slot);
  if (slot) {
    slot.isBooked = false;
    await slot.save();
  }

  res.json({ message: 'Appointment cancelled successfully' });
});

// @desc    Complete an appointment using the 4-digit code
// @route   PUT /api/appointments/:id/complete
// @access  Private/Admin
const completeAppointment = asyncHandler(async (req, res) => {
  const { appointmentCode } = req.body;
  const appointment = await Appointment.findById(req.params.id).populate('user', 'name email');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check if status is correct
  if (appointment.status === 'Completed') {
    res.status(400);
    throw new Error('Appointment is already completed');
  }

  // Note: For legacy appointments missing a code, we'll still require the new process
  // but fail if they send empty. The plan handles user explicitly taking care of manual ones.
  if (appointment.appointmentCode && appointment.appointmentCode !== appointmentCode) {
    res.status(400);
    throw new Error('Invalid check-in code');
  } else if (!appointment.appointmentCode) {
     res.status(400);
     throw new Error('This legacy appointment does not have a check-in code. Mark it in the database.');
  }

  appointment.status = 'Completed';
  await appointment.save();

  // Send Thank You Email
  try {
    const sendEmail = require('../utils/emailService');
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #Cfb53b; border-radius: 10px;">
        <h2 style="color: #Cfb53b; text-align: center;">Thank You for Visiting Trimly!</h2>
        <p>Hi <strong>${appointment.user.name}</strong>,</p>
        <p>We hope you enjoyed your premium grooming session with us!</p>
        <p>Your appointment has been successfully marked as completed. We’d love to see you again soon to keep you looking your sharpest.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #Cfb53b; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book Your Next Session</a>
        </div>
        <br /><br />
        <p>Stay sharp,<br/><strong>The Trimly Team</strong></p>
      </div>
    `;

    await sendEmail({
      email: appointment.user.email,
      subject: 'Thank You for Choosing Trimly!',
      html: emailHtml
    });
  } catch (error) {
    console.error('Failed to send thank you email:', error);
  }

  res.json({ message: 'Appointment marked as completed successfully', appointment });
});

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointments,
  cancelAppointment,
  completeAppointment
};
