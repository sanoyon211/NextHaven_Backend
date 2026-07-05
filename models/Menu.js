const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a menu item name"],
      trim: true,
    },
    category: {
      type: String,
      required: [
        true,
        "Please add a category (e.g., Starters, Main Courses, Desserts)",
      ],
    },
    price: {
      type: String,
      required: [true, "Please add a price"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    ingredients: {
      type: String,
      required: [true, "Please add ingredients"],
    },
    imageUrl: {
      type: String,
      required: [true, "Please add an image URL"],
    },
    isSignature: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Menu", MenuSchema);
