const express = require('express');
const multer = require('multer');
const { prisma } = require('../lib/prisma');
const { requireAnyAuth } = require('../middleware/auth');
const { profileStorage, categoryStorage, menuItemStorage } = require('../config/cloudinary');

const router = express.Router();

// Configure multer with Cloudinary storage
const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const categoryUpload = multer({
  storage: categoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const menuItemUpload = multer({
  storage: menuItemStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload profile image endpoint
router.post('/profile-image', requireAnyAuth(), (req, res, next) => {
  console.log('📸 Profile image upload request received');
  console.log('📋 Headers:', req.headers);
  console.log('📦 Content-Type:', req.headers['content-type']);
  
  profileUpload.single('profileImage')(req, res, (err) => {
    if (err) {
      console.error('❌ Upload error:', err);
      console.error('❌ Error details:', err.message, err.code, err.field);
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    console.log('✅ Upload processed successfully');
    next();
  });
}, async (req, res) => {
  try {
    console.log('☁️ Cloudinary upload - Profile image');
    console.log('File:', req.file);
    
    if (!req.file) {
      console.error('No file received in upload request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get Cloudinary URL from multer-storage-cloudinary
    const imageUrl = req.file.path; // Cloudinary URL

    // Use userId from query parameter (for admin editing others) or use logged-in user's id
    const userId = req.query.userId || req.body.userId || req.user.id;

    // If trying to update another user's profile, check if current user is ADMIN
    if (userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can update other users profile images' });
    }

    // Update user profile with Cloudinary URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
      select: { id: true, email: true, name: true, role: true, phone: true, profileImage: true }
    });

    console.log('✅ Profile image uploaded to Cloudinary:', imageUrl);

    return res.json({ 
      success: true, 
      message: 'Profile image uploaded successfully',
      user: updatedUser,
      profileImage: imageUrl,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('❌ Profile image upload error:', error);
    return res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// Upload category image endpoint
router.post('/category-image', requireAnyAuth(), categoryUpload.single('categoryImage'), async (req, res) => {
  try {
    console.log('☁️ Cloudinary upload - Category image');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get Cloudinary URL
    const imageUrl = req.file.path;

    console.log('✅ Category image uploaded to Cloudinary:', imageUrl);

    return res.json({ 
      success: true, 
      message: 'Category image uploaded successfully',
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('❌ Category image upload error:', error);
    return res.status(500).json({ error: 'Failed to upload category image' });
  }
});

// Upload menu item image endpoint
router.post('/menu-item-image', requireAnyAuth(), menuItemUpload.single('menuItemImage'), async (req, res) => {
  try {
    console.log('☁️ Cloudinary upload - Menu item image');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Get Cloudinary URL
    const imageUrl = req.file.path;

    console.log('✅ Menu item image uploaded to Cloudinary:', imageUrl);

    return res.json({ 
      success: true, 
      message: 'Menu item image uploaded successfully',
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('❌ Menu item image upload error:', error);
    return res.status(500).json({ error: 'Failed to upload menu item image' });
  }
});

module.exports = router;
