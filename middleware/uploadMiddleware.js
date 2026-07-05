const multer = require("multer");

// Use memory storage to hold file data as a buffer
const storage = multer.memoryStorage();

// Configure multer
const uploadImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit each file to 5 MB
  fileFilter: (req, file, cb) => {
    // Check if the uploaded file is an image
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

module.exports = uploadImages;
