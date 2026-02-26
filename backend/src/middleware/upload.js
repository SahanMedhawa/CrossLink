const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get the correct path relative to this file's location
// This file is in: backend/middleware/upload.js
// We want: backend/uploads/projects
const uploadPath = path.join(__dirname, '../uploads/projects');

console.log('📁 Upload path:', uploadPath);

// Ensure the folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('✅ Created uploads directory');
} else {
  console.log('✅ Uploads directory exists');
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('💾 Saving file to:', uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = 'project-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📸 Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter - ONLY allow image files
const fileFilter = (req, file, cb) => {
  console.log('🔍 Checking file type:', file.mimetype);
  
  // Define allowed image MIME types
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff'
  ];
  
  // Check if the file is an image
  if (allowedImageTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    console.log('✅ File type accepted:', file.mimetype);
    cb(null, true);
  } else {
    console.log('❌ File type rejected:', file.mimetype);
    cb(new Error('Only image files are allowed! Please upload an image (JPEG, PNG, GIF, WEBP, etc.)'), false);
  }
};

const upload = multer({
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit (increased from 5MB)
  },
  fileFilter
});

module.exports = upload;