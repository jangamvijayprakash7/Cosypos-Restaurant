const express = require('express');
const { prisma } = require('../lib/prisma');
const { requireAnyAuth } = require('../middleware/auth');
const cache = require('../cache');
const etagMiddleware = require('../middleware/etag-cache');
const deduplicator = require('../request-deduplicator');
const { cloudinary } = require('../config/cloudinary');
const router = express.Router();

// Category Management Routes

// Get all categories
router.get('/categories', etagMiddleware, async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'categories:all';
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('🚀 CACHE HIT! Returning cached categories (instant)');
      return res.json(cached);
    }

    console.log('💾 CACHE MISS - Fetching categories from PostgreSQL (optimized query)...');
    
    // Use deduplication to prevent stampeding herd
    const categories = await deduplicator.deduplicate(cacheKey, async () => {
      const startTime = Date.now();
      const data = await prisma.menuCategory.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          items: {
            select: {
              id: true,
              name: true,
              available: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });
      console.log(`⚡ Query took ${Date.now() - startTime}ms`);
      return data;
    });
    
    // Cache for 1 HOUR (optimized for remote database performance)
    cache.set(cacheKey, categories, 3600000);
    console.log('✅ Stored categories in cache for 1 hour');
    
    // Allow some caching on client side (30 seconds)
    res.set('Cache-Control', 'public, max-age=30');
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create new category
router.post('/categories', requireAnyAuth(), async (req, res) => {
  try {
    const { name, image } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const category = await prisma.menuCategory.create({
      data: {
        name,
        image: image || null
      },
      include: {
        items: true
      }
    });
    
    // Clear cache when data changes
    cache.clearPattern('categories:');
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Update category
router.put('/categories/:id', requireAnyAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;
    
    const category = await prisma.menuCategory.update({
      where: { id },
      data: {
        name,
        image: image || null
      },
      include: {
        items: true
      }
    });
    
    // Clear cache when data changes
    cache.clearPattern('categories:');
    cache.clearPattern('menu-items:');
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
});

// Delete category
router.delete('/categories/:id', requireAnyAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query; // ?force=true to cascade delete
    
    // Check if category has items
    const categoryWithItems = await prisma.menuCategory.findUnique({
      where: { id },
      include: { 
        items: {
          select: {
            id: true,
            name: true,
            priceCents: true
          }
        }
      }
    });
    
    if (!categoryWithItems) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // If category has items and force delete is not requested
    if (categoryWithItems.items.length > 0 && force !== 'true') {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing menu items',
        details: {
          categoryName: categoryWithItems.name,
          itemCount: categoryWithItems.items.length,
          items: categoryWithItems.items.map(item => ({
            id: item.id,
            name: item.name,
            price: `$${(item.priceCents / 100).toFixed(2)}`
          }))
        }
      });
    }
    
    // If force delete is requested, delete all items first - use transaction for atomicity
    if (force === 'true' && categoryWithItems.items.length > 0) {
      console.log(`🗑️ Cascade deleting ${categoryWithItems.items.length} items from category: ${categoryWithItems.name}`);
      
      try {
        // Step 1: Get all menu item IDs in this category
        const menuItemIds = categoryWithItems.items.map(item => item.id);
        console.log(`📋 Menu items to delete: ${menuItemIds.length}`);
        
        // Step 2: Delete all OrderItems that reference these menu items
        const orderItemsDeleted = await prisma.orderItem.deleteMany({
          where: {
            menuItemId: {
              in: menuItemIds
            }
          }
        });
        console.log(`✅ Deleted ${orderItemsDeleted.count} OrderItem(s) referencing these menu items`);
        
        // Step 3: Execute both deletes in a transaction to ensure atomicity
        await prisma.$transaction([
          prisma.menuItem.deleteMany({
            where: { categoryId: id }
          }),
          prisma.menuCategory.delete({
            where: { id }
          })
        ]);
        
        console.log(`✅ Deleted ${categoryWithItems.items.length} menu items and category in transaction`);
      } catch (transactionError) {
        console.error('❌ Transaction failed - no changes committed:', transactionError);
        throw transactionError;
      }
    } else {
      // No items to delete, just delete the category
      await prisma.menuCategory.delete({
        where: { id }
      });
    }
    
    // Clear cache when data changes
    cache.clearPattern('categories:');
    cache.clearPattern('menu-items:');
    
    console.log(`✅ Category deleted: ${categoryWithItems.name}`);
    
    res.json({ 
      message: 'Category deleted successfully',
      deletedItems: force === 'true' ? categoryWithItems.items.length : 0
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
});

// Get all menu items (with pagination and optimization)
router.get('/menu-items', etagMiddleware, async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Default 100 items per page
    const skip = (page - 1) * limit;
    const noPagination = req.query.all === 'true'; // Option to get all items
    
    // Build cache key with pagination
    const cacheKey = noPagination ? 'menu-items:all' : `menu-items:page:${page}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`🚀 CACHE HIT! Returning cached menu items (instant) - Page ${page}`);
      return res.json(cached);
    }

    console.log(`💾 CACHE MISS - Fetching from PostgreSQL (optimized query) - Page ${page}...`);
    
    // Use deduplication to prevent stampeding herd
    const result = await deduplicator.deduplicate(cacheKey, async () => {
      const startTime = Date.now();
      
      // Optimize: Only get count if we're paginating
      const totalCount = noPagination ? null : await prisma.menuItem.count();
      
      // Fetch menu items with optimized query
      const data = await prisma.menuItem.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          priceCents: true,
          categoryId: true,
          stock: true,
          available: true,
          image: true,
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: { name: 'asc' },
        ...(noPagination ? {} : { skip, take: limit })
      });
      
      const queryTime = Date.now() - startTime;
      console.log(`⚡ PostgreSQL query took ${queryTime}ms - Fetched ${data.length} items${noPagination ? ' (ALL)' : ''}`);
      
      if (queryTime > 1000) {
        console.warn(`⚠️ SLOW QUERY WARNING: Query took ${queryTime}ms - Consider using pagination instead of ?all=true`);
      }
      
      return { items: data, total: totalCount || data.length };
    });
    
    // Transform data to match frontend expectations
    const transformedItems = result.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      priceCents: item.priceCents,
      price: `$${(item.priceCents / 100).toFixed(2)}`,
      category: { name: item.category?.name || 'Uncategorized' },
      categoryId: item.categoryId,
      stock: item.stock,
      available: item.available,
      availability: item.available ? 'In Stock' : 'Out of Stock',
      image: item.image || '/default-food.png',
      active: item.available
    }));
    
    // Prepare response with pagination metadata
    const response = noPagination ? transformedItems : {
      items: transformedItems,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: skip + transformedItems.length < result.total
      }
    };
    
    // Cache for 1 HOUR (optimized for remote database performance)
    cache.set(cacheKey, response, 3600000);
    console.log('✅ Stored in cache for 1 hour');
    
    // Allow some caching on client side (30 seconds)
    res.set('Cache-Control', 'public, max-age=30');
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch menu items', details: error.message });
  }
});

// Get menu item by ID
router.get('/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Transform data to match frontend expectations
    const transformedItem = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description || '',
      priceCents: menuItem.priceCents,
      price: `$${(menuItem.priceCents / 100).toFixed(2)}`,
      category: { name: menuItem.category.name },
      stock: menuItem.stock,
      availability: menuItem.available ? 'In Stock' : 'Out of Stock',
      image: menuItem.image || '/default-food.png',
      active: menuItem.available
    };
    
    res.json(transformedItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Create new menu item
router.post('/menu-items', requireAnyAuth(), async (req, res) => {
  try {
    const { name, description, price, category, stock, availability, image } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    
    // Find or create category
    let categoryRecord = await prisma.menuCategory.findUnique({
      where: { name: category }
    });
    
    if (!categoryRecord) {
      categoryRecord = await prisma.menuCategory.create({
        data: { name: category }
      });
    }
    
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description: description || '',
        priceCents: Math.round(parseFloat(price) * 100),
        stock: parseInt(stock) || 0,
        available: availability !== 'Out of Stock',
        image: image || null,
        categoryId: categoryRecord.id
      },
      include: {
        category: true
      }
    });
    
    // Clear cache when data changes
    cache.clearPattern('menu-items:');
    cache.clearPattern('categories:');
    
    // Transform response
    const transformedItem = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description || '',
      priceCents: menuItem.priceCents,
      price: `$${(menuItem.priceCents / 100).toFixed(2)}`,
      category: { name: menuItem.category.name },
      stock: menuItem.stock,
      availability: menuItem.available ? 'In Stock' : 'Out of Stock',
      image: menuItem.image || '/default-food.png',
      active: menuItem.available
    };
    
    res.status(201).json(transformedItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
router.put('/menu-items/:id', requireAnyAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, availability, image } = req.body;
    
    console.log('📝 Update menu item request:', { id, name, price, category, stock, availability });
    
    // Validate category is a string
    if (category && typeof category !== 'string') {
      console.error('❌ Invalid category type:', typeof category, category);
      return res.status(400).json({ error: 'Category must be a string' });
    }
    
    // Find or create category if provided
    let categoryId = null;
    if (category) {
      let categoryRecord = await prisma.menuCategory.findUnique({
        where: { name: category }
      });
      
      if (!categoryRecord) {
        console.log('📁 Creating new category:', category);
        categoryRecord = await prisma.menuCategory.create({
          data: { name: category }
        });
      }
      categoryId = categoryRecord.id;
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.priceCents = Math.round(parseFloat(price) * 100);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (availability !== undefined) updateData.available = availability !== 'Out of Stock';
    if (image !== undefined) updateData.image = image;
    if (categoryId) updateData.categoryId = categoryId;
    
    // Check if menu item exists first
    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    });
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });
    
    // Clear cache when data changes
    cache.clearPattern('menu-items:');
    cache.clearPattern('categories:');
    
    // Transform response
    const transformedItem = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description || '',
      priceCents: menuItem.priceCents,
      price: `$${(menuItem.priceCents / 100).toFixed(2)}`,
      category: { name: menuItem.category.name },
      stock: menuItem.stock,
      availability: menuItem.available ? 'In Stock' : 'Out of Stock',
      image: menuItem.image || '/default-food.png',
      active: menuItem.available
    };
    
    console.log('✅ Menu item updated successfully:', transformedItem.id);
    res.json(transformedItem);
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Menu item not found' });
    } else {
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  }
});

// Delete menu item
router.delete('/menu-items/:id', requireAnyAuth(), async (req, res) => {
  console.log('🗑️ DELETE REQUEST - Starting delete process for ID:', req.params.id);
  try {
    const { id } = req.params;
    console.log('🔍 Step 1: Finding menu item with ID:', id);
    
    // Get the item first to check for Cloudinary image
    const item = await prisma.menuItem.findUnique({
      where: { id },
      select: { image: true, name: true }
    });
    
    console.log('📦 Step 2: Found item:', item ? `${item.name} (image: ${item.image})` : 'NOT FOUND');
    
    if (!item) {
      console.log('❌ Step 2 FAILED: Menu item not found');
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    console.log('🗄️ Step 3: Deleting from database...');
    
    // First, delete all OrderItems that reference this menu item
    console.log('🗑️ Step 3a: Checking for OrderItems referencing this menu item...');
    const orderItemsDeleted = await prisma.orderItem.deleteMany({
      where: { menuItemId: id }
    });
    console.log(`✅ Step 3a: Deleted ${orderItemsDeleted.count} OrderItem(s)`);
    
    // Now delete the menu item itself
    console.log('🗑️ Step 3b: Deleting the menu item...');
    await prisma.menuItem.delete({
      where: { id }
    });
    console.log('✅ Step 3: Successfully deleted from database');
    
    // Delete from Cloudinary if it's a Cloudinary URL
    if (item.image && item.image.includes('cloudinary.com')) {
      console.log('☁️ Step 4: Deleting from Cloudinary...');
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = item.image.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        const publicId = `cosypos/${folder}/${filename}`;
        
        console.log('🔑 Cloudinary public_id:', publicId);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('✅ Step 4: Deleted from Cloudinary:', publicId, 'Result:', result);
      } catch (cloudinaryError) {
        console.warn('⚠️ Step 4 WARNING: Failed to delete from Cloudinary:', cloudinaryError.message);
        console.error('Cloudinary error stack:', cloudinaryError.stack);
        // Don't fail the request if Cloudinary deletion fails
      }
    } else {
      console.log('⏭️ Step 4: Skipping Cloudinary delete (not a Cloudinary image)');
    }
    
    console.log('🧹 Step 5: Clearing cache...');
    // Clear cache when data changes
    cache.clearPattern('menu-items:');
    cache.clearPattern('categories:');
    console.log('✅ Step 5: Cache cleared');
    
    console.log('✅ DELETE COMPLETE: Sending success response');
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('❌❌❌ ERROR DELETING MENU ITEM ❌❌❌');
    console.error('Error type:', error.constructor.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    console.error('Error stack:', error.stack);
    
    if (error.code === 'P2025') {
      console.log('📌 Error is P2025 - Menu item not found');
      res.status(404).json({ error: 'Menu item not found' });
    } else {
      console.log('📌 Error is 500 - Server error');
      res.status(500).json({ error: 'Failed to delete menu item', details: error.message, errorCode: error.code });
    }
  }
});

module.exports = router;

