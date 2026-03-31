const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'crosslink/profiles',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'],
    format: 'webp',
    transformation: [
      {
        width: 500,
        height: 500,
        crop: 'fill',
        gravity: 'face',
        fetch_format: 'webp',
        quality: 'auto',
      },
    ],
    public_id: `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image files are allowed for profile photos.'), false);
};

const profileUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = profileUpload;
