const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { imageOptimizerMiddleware } = require('./middleware/image-optimizer');

dotenv.config();
const app = express();

// Rate limiting to prevent API abuse and overload
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for static files and OPTIONS requests
    return req.path.startsWith('/uploads/') || req.method === 'OPTIONS';
  }
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => req.method === 'OPTIONS' // Skip OPTIONS preflight requests
});

// CORS headers for all requests - MUST be FIRST before rate limiting
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires, If-None-Match, ETag');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Expose-Headers', 'ETag');
  
  // Override any restrictive CORS policies
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  
  // Handle OPTIONS preflight requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Apply rate limiting to all API routes (AFTER CORS)
app.use('/api', apiLimiter);

// Performance middleware
app.use(compression({ 
  level: 6, // Balance between compression and speed
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress images (already optimized)
    if (res.getHeader('Content-Type')?.startsWith('image/')) {
      return false;
    }
    return compression.filter(req, res);
  }
})); // Enable gzip compression

// Image optimization middleware
app.use(imageOptimizerMiddleware);

// Optimize JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Secure image serving route with path traversal protection
app.get('/uploads/:folder/:filename', async (req, res) => {
  try {
    const folder = req.params.folder;
    const filename = req.params.filename;
    
    // Security: Validate folder and filename to prevent path traversal
    const allowedFolders = ['menu-items', 'categories', 'profiles'];
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ error: 'Invalid folder' });
    }
    
    // Reject path traversal attempts (../ or ..\\ or absolute paths)
    if (folder.includes('..') || folder.includes('/') || folder.includes('\\') ||
        filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.warn('⚠️ Path traversal attempt detected:', { folder, filename });
      return res.status(400).json({ error: 'Invalid path' });
    }
    
    // Only allow safe filename characters
    const safeFilenameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!safeFilenameRegex.test(filename)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    // Build the safe path
    const uploadsRoot = path.resolve(__dirname, '../uploads');
    const imagePath = path.join(uploadsRoot, folder, filename);
    
    // Verify the resolved path is within uploads directory (prevent escaping)
    if (!imagePath.startsWith(uploadsRoot)) {
      console.warn('⚠️ Path escape attempt detected:', imagePath);
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Set CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    
    // Set caching headers for static images (1 hour cache)
    res.setHeader('Cache-Control', 'public, max-age=3600, immutable');
    
    // Check if file exists using async file operations
    try {
      const stats = await fs.stat(imagePath);
      if (!stats.isFile()) {
        return res.status(404).json({ error: 'Not a file' });
      }
      
      // Send the file
      res.sendFile(imagePath);
    } catch (statError) {
      if (statError.code === 'ENOENT') {
        res.status(404).json({ error: 'Image not found' });
      } else {
        console.error('Error accessing file:', statError);
        res.status(500).json({ error: 'Server error' });
      }
    }
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Development-only test endpoints
if (process.env.NODE_ENV === 'development' || process.env.ENABLE_TEST_ENDPOINTS === 'true') {
  console.log('⚠️ Test endpoints enabled (development mode)');
  
  // Test endpoint to verify CORS headers
  app.get('/test-cors', (req, res) => {
    console.log('Test CORS route hit');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.json({ message: 'CORS test successful', timestamp: new Date().toISOString() });
  });

  // Simple test route
  app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Test route working', timestamp: new Date().toISOString() });
  });
  
  // Test CORS endpoint
  app.get('/api/cors-test', (_req, res) => {
    console.log('CORS test endpoint called');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ cors: 'working', timestamp: new Date().toISOString() });
  });

  // Test deployment endpoint
  app.get('/api/deployment-test', (_req, res) => {
    console.log('🚀 Deployment test endpoint called');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ 
      message: '🎉 DEPLOYMENT TEST SUCCESSFUL!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'PostgreSQL',
      status: 'working'
    });
  });

  // Test image endpoint with explicit CORS headers
  app.get('/api/test-image', (_req, res) => {
    console.log('🧪 Test image endpoint called');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.json({ 
      message: 'Test image endpoint with CORS headers',
      timestamp: new Date().toISOString(),
      headers: {
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'unsafe-none'
      }
    });
  });
}

// Handle OPTIONS requests for auth routes specifically
app.options('/api/auth/login', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, If-None-Match, ETag');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Expose-Headers', 'ETag');
  res.status(200).end();
});

app.options('/api/auth/register', (req, res) => {
  console.log('OPTIONS request for auth route');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, If-None-Match, ETag');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Expose-Headers', 'ETag');
  res.status(200).end();
});

// Additional CORS handler for all API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, If-None-Match, ETag');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Expose-Headers', 'ETag');
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Final middleware to override any restrictive headers
app.use((req, res, next) => {
  // Override any restrictive CORS headers that might have been set
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, If-None-Match, ETag');
  res.setHeader('Access-Control-Expose-Headers', 'ETag, Content-Length, Content-Type');
  
  next();
});

// Load routes
console.log('Loading routes...');
app.use('/api/auth', authLimiter, require('./routes/auth'));
console.log('Auth routes loaded');
app.use('/api', require('./routes/upload'));
console.log('Upload routes loaded');
app.use('/api/orders', require('./routes/orders'));
console.log('Orders routes loaded');
app.use('/api/reservations', require('./routes/reservations'));
console.log('Reservations routes loaded');

// Load menu routes at /api (serves both /api/menu-items and /api/categories for backward compatibility)
// The menu router internally handles routes like /menu-items, /categories
app.use('/api', require('./routes/menu'));
console.log('Menu routes loaded at /api/* (serves /api/menu-items, /api/categories, etc.)');

app.use('/api/inventory', require('./routes/inventory'));
console.log('Inventory routes loaded');
app.use('/api/users', require('./routes/users'));
console.log('Users routes loaded');
app.use('/api/attendance', require('./routes/attendance'));
console.log('Attendance routes loaded');
console.log('All routes loaded successfully');

const port = Number(process.env.PORT||4000);
app.listen(port, () => {
  console.log('API listening on http://localhost:'+port);
});
