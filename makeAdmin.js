const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const result = await User.updateMany({}, { role: 'admin' });
    console.log(`Updated ${result.modifiedCount} users to admin role.`);

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
