const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = multer.memoryStorage();

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

const uploadToCloudinary = async (req, res, next) => {
  if (!req.file?.buffer) {
    return next();
  }

  try {
    const publicId = `project-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'crosslink/projects',
          resource_type: 'image',
          public_id: publicId,
          format: 'webp',
          transformation: [
            {
              width: 1000,
              crop: 'limit',
              fetch_format: 'webp',
              quality: 'auto'
            }
          ]
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );

      stream.end(req.file.buffer);
    });

    req.file.path = result.secure_url;
    req.file.filename = result.public_id;
    return next();
  } catch (error) {
    return next(error);
  }
};

const uploadMiddleware = {
  single(fieldName) {
    return (req, res, next) => {
      upload.single(fieldName)(req, res, (error) => {
        if (error) {
          return next(error);
        }
        return uploadToCloudinary(req, res, next);
      });
    };
  }
};

module.exports = uploadMiddleware;