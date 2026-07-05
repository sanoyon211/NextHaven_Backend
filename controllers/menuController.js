const Menu = require("../models/Menu");

const cloudinary = require("../config/cloudinary");

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getAllMenuItems = async (req, res) => {
  try {
    const { isSignature } = req.query;

    let query = {};
    if (isSignature === "true") {
      query.isSignature = true;
    }

    const menuItems = await Menu.find(query);

    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error(`Get All Menu Items Error: ${error.message}`);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = async (req, res) => {
  try {
    const { name, category, price, description, ingredients, isSignature } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    // Upload image to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "nexthaven/menu",
    });

    const newMenuItem = await Menu.create({
      name,
      category,
      price,
      description,
      ingredients,
      isSignature: isSignature === "true",
      imageUrl: result.secure_url,
    });

    res.status(201).json({ success: true, menuItem: newMenuItem });
  } catch (error) {
    console.error(`Create Menu Item Error: ${error.message}`);
    res.status(500).json({ message: "Failed to create menu item" });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
  try {
    const { name, category, price, description, ingredients, isSignature } =
      req.body;
    let menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    let imageUrl = menuItem.imageUrl;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "nexthaven/menu",
      });
      imageUrl = result.secure_url;
    }

    menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        price,
        description,
        ingredients,
        isSignature: isSignature === "true" || isSignature === true,
        imageUrl,
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, menuItem });
  } catch (error) {
    console.error(`Update Menu Item Error: ${error.message}`);
    res.status(500).json({ message: "Failed to update menu item" });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await menuItem.deleteOne();

    res.status(200).json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    console.error(`Delete Menu Item Error: ${error.message}`);
    res.status(500).json({ message: "Failed to delete menu item" });
  }
};

module.exports = {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
