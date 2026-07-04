const Menu = require('../models/Menu');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getAllMenuItems = async (req, res) => {
  try {
    const { isSignature } = req.query;
    
    let query = {};
    if (isSignature === 'true') {
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
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
};

module.exports = { getAllMenuItems };
