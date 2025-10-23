const express = require('express');
const router = express.Router();
const { prisma } = require('../lib/prisma');
const cache = require('../cache');
const etagMiddleware = require('../middleware/etag-cache');

// Get all orders (with pagination)
router.get('/', etagMiddleware, async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Default 50 orders per page
    const skip = (page - 1) * limit;
    const noPagination = req.query.all === 'true'; // Option to get all orders
    
    // Use versioned cache key to prevent race conditions
    const version = cache.getVersion('orders');
    const cacheKey = noPagination ? `orders:${version}:all` : `orders:${version}:page:${page}:${limit}`;
    try {
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log(`🚀 CACHE HIT! Returning cached orders (version ${version}, instant) - Page ${page}`);
        return res.json(cached);
      }
    } catch (cacheError) {
      console.error('Cache read error:', cacheError);
      // Continue to database query
    }

    console.log(`💾 CACHE MISS - Fetching orders from PostgreSQL - Page ${page}...`);
    const startTime = Date.now();
    
    // Get total count for pagination
    const totalCount = await prisma.order.count();
    
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        status: true,
        totalCents: true,
        createdAt: true,
        userId: true,
        tableId: true,
        items: {
          select: {
            qty: true,
            priceCents: true,
            menuItem: {
              select: {
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: {
          select: {
            id: true,
            label: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(noPagination ? {} : { skip, take: limit })
    });
    console.log(`⚡ Orders query took ${Date.now() - startTime}ms - Fetched ${orders.length} orders`);

    // Transform the data to match frontend format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.id.slice(-4),
      customerName: order.user?.name || 'Guest',
      customerId: order.userId,
      customerEmail: order.user?.email,
      date: order.createdAt.toLocaleDateString('en-US', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      time: order.createdAt.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      status: order.status,
      statusColor: getStatusColor(order.status),
      statusDot: getStatusDot(order.status),
      items: order.items.map(item => ({
        name: item.menuItem.name,
        quantity: item.qty,
        price: item.priceCents / 100
      })),
      subtotal: order.totalCents / 100,
      tableLabel: order.table?.label
    }));
    
    // Prepare response with pagination metadata
    const response = noPagination ? transformedOrders : {
      items: transformedOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + transformedOrders.length < totalCount
      }
    };
    
    // Cache for 2 MINUTES (orders change frequently, but still cache longer)
    try {
      cache.set(cacheKey, response, 120000);
    } catch (cacheError) {
      console.error('Cache write error:', cacheError);
      // Continue - data will be returned without caching
    }
    
    // Allow client caching for 5 seconds
    res.set('Cache-Control', 'public, max-age=5');

    res.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { items, userId, tableId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Calculate total
    const totalCents = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity * 100); // Convert to cents
    }, 0);

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        tableId: tableId || null,
        totalCents,
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            menuItemId: item.menuItemId, // Assuming frontend sends menuItemId
            qty: item.quantity,
            priceCents: Math.round(item.price * 100) // Convert to cents
          }))
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: {
          select: {
            id: true,
            label: true
          }
        }
      }
    });

    // Transform the response
    const transformedOrder = {
      id: order.id,
      orderNumber: order.id.slice(-4),
      customerName: order.user?.name || 'Guest',
      customerId: order.userId,
      customerEmail: order.user?.email,
      date: order.createdAt.toLocaleDateString('en-US', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      time: order.createdAt.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      status: order.status,
      statusColor: getStatusColor(order.status),
      statusDot: getStatusDot(order.status),
      items: order.items.map(item => ({
        name: item.menuItem.name,
        quantity: item.qty,
        price: item.priceCents / 100
      })),
      subtotal: order.totalCents / 100,
      tableLabel: order.table?.label
    };

    // Increment cache version instead of clearing (prevents race conditions)
    try {
      cache.incrementVersion('orders');
      // Also clear old versioned keys for cleanup
      cache.clearPattern('orders:');
    } catch (cacheError) {
      console.error('❌ Cache invalidation failed (orders pattern):', cacheError.message || cacheError);
      // Continue - order was created successfully, cache will expire naturally
    }

    res.status(201).json(transformedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update an order
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { items, status, userId, tableId } = req.body;

    // Calculate new total if items are provided
    let totalCents;
    if (items && items.length > 0) {
      totalCents = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity * 100);
      }, 0);
    }

    const updateData = {
      ...(status && { status }),
      ...(userId && { userId }),
      ...(tableId && { tableId }),
      ...(totalCents !== undefined && { totalCents })
    };

    // If updating items, delete existing items and create new ones
    if (items && items.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { orderId: id }
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        ...(items && items.length > 0 && {
          items: {
            create: items.map(item => ({
              menuItemId: item.menuItemId,
              qty: item.quantity,
              priceCents: Math.round(item.price * 100)
            }))
          }
        })
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: {
          select: {
            id: true,
            label: true
          }
        }
      }
    });

    // Transform the response
    const transformedOrder = {
      id: order.id,
      orderNumber: order.id.slice(-4),
      customerName: order.user?.name || 'Guest',
      customerId: order.userId,
      customerEmail: order.user?.email,
      date: order.createdAt.toLocaleDateString('en-US', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      time: order.createdAt.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      status: order.status,
      statusColor: getStatusColor(order.status),
      statusDot: getStatusDot(order.status),
      items: order.items.map(item => ({
        name: item.menuItem.name,
        quantity: item.qty,
        price: item.priceCents / 100
      })),
      subtotal: order.totalCents / 100,
      tableLabel: order.table?.label
    };

    // Increment cache version instead of clearing (prevents race conditions)
    try {
      cache.incrementVersion('orders');
      // Also clear old versioned keys for cleanup
      cache.clearPattern('orders:');
    } catch (cacheError) {
      console.error('❌ Cache invalidation failed (orders pattern):', cacheError.message || cacheError);
      // Continue - order was updated successfully, cache will expire naturally
    }

    res.json(transformedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete order items first (due to foreign key constraint)
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });

    // Delete the order
    await prisma.order.delete({
      where: { id }
    });

    // Increment cache version instead of clearing (prevents race conditions)
    try {
      cache.incrementVersion('orders');
      // Also clear old versioned keys for cleanup
      cache.clearPattern('orders:');
    } catch (cacheError) {
      console.error('❌ Cache invalidation failed (orders pattern):', cacheError.message || cacheError);
      // Continue - order was deleted successfully, cache will expire naturally
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Get menu items for order creation
router.get('/menu-items', async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: true
      },
      where: {
        available: true
      }
    });

    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Helper functions
function getStatusColor(status) {
  switch (status) {
    case 'PENDING':
      return '#FF9800'; // Orange for pending
    case 'IN_PROGRESS':
      return '#FAC1D9'; // Pink for in progress
    case 'SERVED':
      return '#4CAF50'; // Green for ready
    case 'PAID':
      return '#2196F3'; // Blue for completed
    case 'CANCELLED':
      return '#F44336'; // Red for cancelled
    default:
      return '#FAC1D9';
  }
}

function getStatusDot(status) {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'IN_PROGRESS':
      return 'Cooking Now';
    case 'SERVED':
      return 'Ready to serve';
    case 'PAID':
      return 'Paid';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Pending';
  }
}

module.exports = router;