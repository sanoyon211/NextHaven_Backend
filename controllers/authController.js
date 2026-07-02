const admin = require('../config/firebase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Sync Firebase user to MongoDB and set JWT cookie
// @route   POST /api/auth/sync
// @access  Public
const syncUser = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: 'Firebase token is required' });
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
        name: name || 'User', // Fallback if name is missing
        avatar: picture || '',
        role: 'guest',
      });
    }

    // Generate custom JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set JWT in HTTP-only, secure cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: 'User synced successfully',
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
    res.status(401).json({ message: 'Invalid Firebase token or sync failed' });
  }
};

module.exports = { syncUser };
