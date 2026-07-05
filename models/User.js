const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["guest", "admin"],
      default: "guest",
    },
    points: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      enum: ["Silver", "Gold", "Platinum"],
      default: "Silver",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
