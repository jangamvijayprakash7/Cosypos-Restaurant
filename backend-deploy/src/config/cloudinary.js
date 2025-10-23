const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage for different image types
const createCloudinaryStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `cosypos/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { quality: 'auto', fetch_format: 'auto' } // Automatic optimization
      ]
    }
  });
};

// Storage configurations for different upload types
const profileStorage = createCloudinaryStorage('profiles');
const categoryStorage = createCloudinaryStorage('categories');
const menuItemStorage = createCloudinaryStorage('menu-items');

module.exports = {
  cloudinary,
  profileStorage,
  categoryStorage,
  menuItemStorage
};

