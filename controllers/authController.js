const admin = require("../config/firebase");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

// @desc    Sync Firebase user to MongoDB and set JWT cookie
// @route   POST /api/auth/sync
// @access  Public
const syncUser = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase token is required" });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);

    const { uid, email, name, picture } = decodedToken;

    // Find user in MongoDB or create a new one
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        name: name || "User", // Fallback if name is missing
        avatar: picture || "",
        role: "guest",
      });
    }

    // Generate custom JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    // Set JWT in HTTP-only, secure cookie
    // For cross-origin cookies to work, sameSite must be 'none' and secure must be true.
    const isProduction = process.env.NODE_ENV === "production" || process.env.FRONTEND_URL?.includes("https");
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax", // Prevent CSRF attacks locally, allow cross-site in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "User synced successfully",
      token, // Return token for frontend localStorage
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`Sync User Error: ${error.message}`);
    res.status(401).json({ message: "Invalid Firebase token or sync failed" });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-firebaseUid");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(`Get Current User Error: ${error.message}`);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    let user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "nexthaven/users",
      });
      user.avatar = result.secure_url;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`Update Profile Error: ${error.message}`);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// @desc    Logout user and clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production" || process.env.FRONTEND_URL?.includes("https");
  res.cookie("jwt", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};

module.exports = { syncUser, getCurrentUser, updateProfile, logout };
