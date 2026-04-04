const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars from the correct relative path
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const barberRoutes = require('./routes/barberRoutes');
const slotRoutes = require('./routes/slotRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
