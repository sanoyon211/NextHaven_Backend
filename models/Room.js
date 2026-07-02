const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      enum: ['single', 'double', 'suite', 'deluxe'],
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
    },
    amenities: {
      type: [String],
    },
    status: {
      type: String,
      enum: ['available', 'maintenance'],
      default: 'available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
