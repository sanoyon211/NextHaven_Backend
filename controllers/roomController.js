const Room = require('../models/Room');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper function to upload a buffer to Cloudinary via stream
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'nexthaven_rooms' }, // Upload to a specific folder in Cloudinary
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    // Convert the buffer to a readable stream and pipe it to Cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// @desc    Create a new room with image uploads
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  try {
    const { title, description, roomType, pricePerNight, capacity, amenities } = req.body;

    // Validate required fields
    if (!title || !description || !roomType || !pricePerNight || !capacity) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Upload images to Cloudinary if any files were provided
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
      // Wait for all uploads to finish
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.secure_url);
    }

    // Parse amenities (could be sent as JSON string or comma-separated string from formData)
    let parsedAmenities = [];
    if (amenities) {
      try {
        parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
      } catch (err) {
        // Fallback for comma-separated list
        parsedAmenities = amenities.split(',').map((item) => item.trim());
      }
    }

    // Create and save the room document
    const newRoom = await Room.create({
      title,
      description,
      roomType,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      amenities: parsedAmenities,
      images: imageUrls,
    });

    res.status(201).json({
      message: 'Room created successfully',
      room: newRoom,
    });
  } catch (error) {
    console.error(`Create Room Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to create room' });
  }
};

module.exports = { createRoom };
