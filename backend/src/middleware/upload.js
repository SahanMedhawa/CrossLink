const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get the correct path relative to this file's location
// This file is in: backend/middleware/upload.js
// We want: backend/uploads/projects
const uploadPath = path.join(__dirname, '../uploads/projects');

console.log(' Upload path:', uploadPath);

// Ensure the folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log(' Created uploads directory');
} else {
  console.log(' Uploads directory exists');
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(' Saving file to:', uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = 'project-' + uniqueSuffix + path.extname(file.originalname);
    console.log(' Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log(' Checking file type:', file.mimetype);
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

module.exports = upload;