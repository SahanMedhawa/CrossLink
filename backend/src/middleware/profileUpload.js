const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = multer.memoryStorage();

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

const uploadToCloudinary = async (req, res, next) => {
  if (!req.file?.buffer) {
    return next();
  }

  try {
    const publicId = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'crosslink/profiles',
          resource_type: 'image',
          public_id: publicId,
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

const profileUploadMiddleware = {
  single(fieldName) {
    return (req, res, next) => {
      profileUpload.single(fieldName)(req, res, (error) => {
        if (error) {
          return next(error);
        }
        return uploadToCloudinary(req, res, next);
      });
    };
  }
};

module.exports = profileUploadMiddleware;
