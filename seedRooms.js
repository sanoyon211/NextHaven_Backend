require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("./models/Room");

const seedRooms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    await Room.deleteMany();
    console.log("Existing rooms cleared.");

    const roomsData = [
      {
        title: "Ocean View Suite",
        description:
          "A luxurious suite with breathtaking views of the ocean. Features a king-size bed, private balcony, and a spa-like bathroom.",
        roomType: "suite",
        pricePerNight: 350,
        capacity: 2,
        images: [
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
        ],
        amenities: ["WiFi", "AC", "Breakfast", "Mini Bar", "Ocean View"],
        status: "available",
      },
      {
        title: "Executive Deluxe Room",
        description:
          "Perfect for business travelers, this deluxe room offers a comfortable workspace, high-speed internet, and premium bedding.",
        roomType: "deluxe",
        pricePerNight: 200,
        capacity: 2,
        images: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
        ],
        amenities: ["WiFi", "AC", "Desk", "Coffee Maker"],
        status: "available",
      },
      {
        title: "Cozy Single Room",
        description:
          "A compact and cozy room designed for solo travelers. Includes all essential amenities for a comfortable stay.",
        roomType: "single",
        pricePerNight: 90,
        capacity: 1,
        images: [
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800",
        ],
        amenities: ["WiFi", "AC", "TV"],
        status: "available",
      },
      {
        title: "Family Double Room",
        description:
          "Spacious room ideal for small families or groups. Features two queen-size beds and a seating area.",
        roomType: "double",
        pricePerNight: 150,
        capacity: 4,
        images: [
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800",
        ],
        amenities: ["WiFi", "AC", "Breakfast", "TV"],
        status: "available",
      },
      {
        title: "Presidential Suite",
        description:
          "The epitome of luxury. This expansive suite offers panoramic city views, a private dining area, and dedicated butler service.",
        roomType: "suite",
        pricePerNight: 850,
        capacity: 4,
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800",
        ],
        amenities: [
          "WiFi",
          "AC",
          "Breakfast",
          "Mini Bar",
          "City View",
          "Butler",
        ],
        status: "available",
      },
      {
        title: "Garden View Deluxe",
        description:
          "Relax with peaceful garden views. This deluxe room features elegant decor and a private patio.",
        roomType: "deluxe",
        pricePerNight: 220,
        capacity: 2,
        images: [
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800",
        ],
        amenities: ["WiFi", "AC", "Patio", "Garden View"],
        status: "available",
      },
      {
        title: "Standard Double Room",
        description:
          "Comfortable and affordable double room with modern amenities and a cozy atmosphere.",
        roomType: "double",
        pricePerNight: 120,
        capacity: 2,
        images: [
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800",
        ],
        amenities: ["WiFi", "AC", "TV"],
        status: "available",
      },
      {
        title: "Premium Single Room",
        description:
          "Upgraded single room with premium furnishings, a larger bed, and city views.",
        roomType: "single",
        pricePerNight: 110,
        capacity: 1,
        images: [
          "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800",
        ],
        amenities: ["WiFi", "AC", "City View", "TV"],
        status: "available",
      },
      {
        title: "Honeymoon Suite",
        description:
          "Romantic suite designed for couples. Features a king-size canopy bed, jacuzzi, and complimentary champagne.",
        roomType: "suite",
        pricePerNight: 450,
        capacity: 2,
        images: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800",
        ],
        amenities: ["WiFi", "AC", "Breakfast", "Jacuzzi", "Champagne"],
        status: "available",
      },
      {
        title: "City Center Deluxe",
        description:
          "Located right in the heart of the city, this deluxe room offers convenience and luxury for urban explorers.",
        roomType: "deluxe",
        pricePerNight: 240,
        capacity: 3,
        images: [
          "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800",
        ],
        amenities: ["WiFi", "AC", "City View", "Gym Access"],
        status: "available",
      },
    ];

    const roomsWithNumbers = roomsData.map((room, index) => ({
      ...room,
      roomNumber: String(101 + index),
    }));

    await Room.insertMany(roomsWithNumbers);
    console.log("10 rooms successfully seeded!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedRooms();
