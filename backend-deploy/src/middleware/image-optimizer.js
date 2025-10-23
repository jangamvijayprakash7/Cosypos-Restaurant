/**
 * Image Optimization Middleware
 * Automatically serves optimized, compressed, and resized images
 * Supports multiple sizes for responsive loading
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// In-memory cache for optimized images
const imageCache = new Map();
const MAX_CACHE_SIZE = 100; // Cache up to 100 images

// Image size presets
const SIZES = {
  thumbnail: { width: 150, height: 150, quality: 80 },
  small: { width: 300, height: 300, quality: 85 },
  medium: { width: 600, height: 600, quality: 90 },
  large: { width: 1200, height: 1200, quality: 95 },
  original: null // No resizing
};

/**
 * Get optimized image
 * @param {string} imagePath - Full path to image
 * @param {string} size - Size preset (thumbnail, small, medium, large, original)
 * @returns {Promise<Buffer>} Optimized image buffer
 */
async function getOptimizedImage(imagePath, size = 'medium') {
  const sizeConfig = SIZES[size] || SIZES.medium;
  
  // Generate cache key
  const cacheKey = `${imagePath}:${size}`;
  
  // Check memory cache first
  if (imageCache.has(cacheKey)) {
    console.log(`🚀 Image cache HIT: ${path.basename(imagePath)} (${size})`);
    return imageCache.get(cacheKey);
  }
  
  console.log(`📸 Processing image: ${path.basename(imagePath)} (${size})`);
  const startTime = Date.now();
  
  try {
    // Read original image
    const imageBuffer = await fs.readFile(imagePath);
    
    // If original size requested, just compress
    if (!sizeConfig) {
      const optimized = await sharp(imageBuffer)
        .jpeg({ quality: 90, progressive: true })
        .png({ quality: 90, compressionLevel: 9 })
        .webp({ quality: 90 })
        .toBuffer();
      
      // Cache the result
      addToCache(cacheKey, optimized);
      console.log(`✅ Image compressed in ${Date.now() - startTime}ms`);
      return optimized;
    }
    
    // Resize and optimize
    const optimized = await sharp(imageBuffer)
      .resize(sizeConfig.width, sizeConfig.height, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true // Don't upscale small images
      })
      .jpeg({ quality: sizeConfig.quality, progressive: true })
      .png({ quality: sizeConfig.quality, compressionLevel: 9 })
      .webp({ quality: sizeConfig.quality })
      .toBuffer();
    
    // Cache the result
    addToCache(cacheKey, optimized);
    console.log(`✅ Image optimized in ${Date.now() - startTime}ms (${size}: ${sizeConfig.width}x${sizeConfig.height})`);
    
    return optimized;
  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    // Return original image as fallback
    return await fs.readFile(imagePath);
  }
}

/**
 * Add image to cache with size limit
 */
function addToCache(key, buffer) {
  // Simple LRU: remove oldest if cache is full
  if (imageCache.size >= MAX_CACHE_SIZE) {
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }
  imageCache.set(key, buffer);
}

/**
 * Clear image cache for a specific path or all
 */
function clearCache(pattern) {
  if (!pattern) {
    imageCache.clear();
    console.log('🗑️ Cleared all image cache');
    return;
  }
  
  let cleared = 0;
  for (const key of imageCache.keys()) {
    if (key.includes(pattern)) {
      imageCache.delete(key);
      cleared++;
    }
  }
  console.log(`🗑️ Cleared ${cleared} cached images matching: ${pattern}`);
}

/**
 * Express middleware for optimized image serving
 */
function imageOptimizerMiddleware(req, res, next) {
  const originalSendFile = res.sendFile.bind(res);
  
  // Override sendFile to optimize images
  res.sendFile = async function(filePath, options) {
    // Check if it's an image
    const ext = path.extname(filePath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    
    if (!isImage) {
      return originalSendFile(filePath, options);
    }
    
    try {
      // Get size from query parameter (default: medium)
      const size = req.query.size || 'medium';
      
      // Validate size
      if (!SIZES[size]) {
        return originalSendFile(filePath, options);
      }
      
      // Get optimized image
      const optimizedBuffer = await getOptimizedImage(filePath, size);
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
      res.setHeader('X-Image-Size', size);
      res.setHeader('X-Image-Optimized', 'true');
      
      // Send optimized image
      return res.send(optimizedBuffer);
    } catch (error) {
      console.error('Error in image optimization middleware:', error);
      // Fallback to original
      return originalSendFile(filePath, options);
    }
  };
  
  next();
}

module.exports = {
  imageOptimizerMiddleware,
  getOptimizedImage,
  clearCache,
  SIZES
};

