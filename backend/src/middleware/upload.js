const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'crosslink/projects',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'],
    format: 'webp',
    transformation: [
      {
        width: 1000,
        crop: 'limit',
        fetch_format: 'webp',
        quality: 'auto'
      }
    ],
    public_id: `project-${Date.now()}-${Math.round(Math.random() * 1e9)}`
  })
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