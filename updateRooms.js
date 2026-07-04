require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

const update = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const rooms = await Room.find({});
  let number = 201;
  for (let r of rooms) {
    if (!r.roomNumber) {
      r.roomNumber = String(number++);
      await r.save();
    }
  }
  console.log('Rooms updated with room numbers');
  process.exit(0);
};
update();
