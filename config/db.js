const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (
      !process.env.MONGO_URI ||
      process.env.MONGO_URI === "your_mongodb_connection_string_here"
    ) {
      console.warn(
        "MongoDB connection skipped: Please provide a valid MONGO_URI in your .env file",
      );
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
