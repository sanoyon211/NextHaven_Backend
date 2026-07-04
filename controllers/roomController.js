const Room = require('../models/Room');
const Booking = require('../models/Booking');
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

// @desc    Get all rooms with search, filter, and availability
// @route   GET /api/rooms
// @access  Public
const getAllRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, capacity, minPrice, maxPrice, roomType, amenities } = req.query;

    let query = { status: 'available' };

    // 1. Availability Calculation Logic
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate) || isNaN(checkOutDate)) {
        return res.status(400).json({ message: 'Invalid checkIn or checkOut date format' });
      }

      // Find overlapping bookings
      // Overlap condition: Booking starts before requested checkout AND ends after requested checkin
      const overlappingBookings = await Booking.find({
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate },
      });

      // Extract unique room ObjectIds
      const bookedRoomIds = overlappingBookings.map((booking) => booking.room);

      // Exclude booked rooms
      if (bookedRoomIds.length > 0) {
        query._id = { $nin: bookedRoomIds };
      }
    }

    // 2. Multi-Parametric Filtering
    if (capacity && !isNaN(capacity)) {
      query.capacity = { $gte: Number(capacity) };
    }

    if ((minPrice && !isNaN(minPrice)) || (maxPrice && !isNaN(maxPrice))) {
      query.pricePerNight = {};
      if (minPrice && !isNaN(minPrice)) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) query.pricePerNight.$lte = Number(maxPrice);
    }

    if (roomType) {
      const typesArray = roomType.split(',').map((item) => item.trim().toLowerCase());
      query.roomType = { $in: typesArray };
    }

    if (amenities) {
      // Split comma-separated string into array
      const amenitiesArray = amenities.split(',').map((item) => item.trim());
      query.amenities = { $all: amenitiesArray };
    }

    // Execute query
    console.log("Query object:", JSON.stringify(query));
    let rooms = await Room.find(query);
    
    // Dynamic Pricing (Weekend Surge)
    let isDynamicPriceApplied = false;
    if (checkIn) {
      const checkInDateObj = new Date(checkIn);
      const day = checkInDateObj.getDay();
      // Friday (5) or Saturday (6)
      if (day === 5 || day === 6) {
        isDynamicPriceApplied = true;
        rooms = rooms.map(room => {
          const roomObj = room.toObject ? room.toObject() : room;
          roomObj.pricePerNight = Math.ceil(roomObj.pricePerNight * 1.2); // 20% surge
          return roomObj;
        });
      }
    }

    res.status(200).json({
      success: true,
      count: rooms.length,
      isDynamicPriceApplied,
      rooms,
    });
  } catch (error) {
    console.error(`Get All Rooms Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    let room = null;

    if (mongoose.isValidObjectId(req.params.id)) {
      room = await Room.findById(req.params.id);
    } 
    
    if (!room) {
      // Fallback: try to find by roomType (e.g., 'superior')
      room = await Room.findOne({ roomType: req.params.id.toLowerCase() });
    }

    if (!room) {
      // Fallback: try to find by title slug (e.g., 'standard-room')
      const titleRegex = new RegExp('^' + req.params.id.replace(/-/g, ' ') + '$', 'i');
      room = await Room.findOne({ title: { $regex: titleRegex } });
    }

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error(`Get Room By ID Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch room' });
  }
};

module.exports = { createRoom, getAllRooms, getRoomById };
