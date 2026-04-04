const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Barber = require('./models/Barber');
const Slot = require('./models/Slot');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const sampleBarbers = [
  { name: 'Michael Scissors', specialty: 'Classic Cuts', experience: '10 years', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&h=500&fit=crop' },
  { name: 'Arthur Fade', specialty: 'Skin Fades & Beard', experience: '6 years', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&h=500&fit=crop' },
  { name: 'Marcus Shave', specialty: 'Hot Towel Shave', experience: '15 years', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=500&fit=crop' }
];

const seedData = async () => {
  await connectDB();

  try {
    // Clear out previous data
    await Slot.deleteMany();
    await Barber.deleteMany();

    const createdBarbers = await Barber.insertMany(sampleBarbers);
    console.log('✅ Barbers Imported!');

    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create slots for today and the next 6 days
    for (let day = 0; day < 7; day++) {
      const slotDate = new Date(today);
      slotDate.setDate(slotDate.getDate() + day);

      for (const barber of createdBarbers) {
        // 9 AM to 5 PM
        for (let hour = 9; hour <= 17; hour++) {
          const timeString = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 && hour !== 24 ? 'PM' : 'AM'}`;
          slots.push({
            barber: barber._id,
            date: slotDate,
            time: timeString
          });
        }
      }
    }

    await Slot.insertMany(slots);
    console.log('✅ Time Slots Imported!');
    console.log('Data generation complete!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
