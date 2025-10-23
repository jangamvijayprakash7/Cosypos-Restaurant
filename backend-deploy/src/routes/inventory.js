const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Mock inventory data - in a real app, this would come from the database
let inventoryItems = [
  {
    id: 1,
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    priceCents: 2500,
    category: { name: 'Pizza' },
    stock: 50,
    availability: 'In Stock',
    image: '/pizza.jpg',
    active: true
  },
  {
    id: 2,
    name: 'Pepperoni Pizza',
    description: 'Delicious pizza topped with spicy pepperoni and mozzarella',
    priceCents: 2800,
    category: { name: 'Pizza' },
    stock: 45,
    availability: 'In Stock',
    image: '/pizza.jpg',
    active: true
  },
  {
    id: 3,
    name: 'BBQ Chicken Pizza',
    description: 'Grilled chicken with BBQ sauce, onions, and cheese',
    priceCents: 3200,
    category: { name: 'Pizza' },
    stock: 35,
    availability: 'In Stock',
    image: '/pizza.jpg',
    active: true
  },
  {
    id: 4,
    name: 'Veggie Supreme Pizza',
    description: 'Loaded with bell peppers, mushrooms, onions, and olives',
    priceCents: 2600,
    category: { name: 'Pizza' },
    stock: 40,
    availability: 'In Stock',
    image: '/pizza.jpg',
    active: true
  },
  {
    id: 5,
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    priceCents: 1800,
    category: { name: 'Burger' },
    stock: 75,
    availability: 'In Stock',
    image: '/burger.jpg',
    active: true
  },
  {
    id: 6,
    name: 'Chicken Burger',
    description: 'Grilled chicken breast with lettuce, tomato, and mayo',
    priceCents: 2000,
    category: { name: 'Burger' },
    stock: 60,
    availability: 'In Stock',
    image: '/burger.jpg',
    active: true
  },
  {
    id: 7,
    name: 'Cheeseburger',
    description: 'Beef patty with melted cheese, lettuce, and tomato',
    priceCents: 2100,
    category: { name: 'Burger' },
    stock: 55,
    availability: 'In Stock',
    image: '/burger.jpg',
    active: true
  },
  {
    id: 8,
    name: 'Bacon Burger',
    description: 'Beef patty with crispy bacon and cheddar cheese',
    priceCents: 2400,
    category: { name: 'Burger' },
    stock: 45,
    availability: 'In Stock',
    image: '/burger.jpg',
    active: true
  },
  {
    id: 9,
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast with marinara sauce and mozzarella cheese',
    priceCents: 2200,
    category: { name: 'Chicken' },
    stock: 65,
    availability: 'In Stock',
    image: '/chicken-parmesan.png',
    active: true
  },
  {
    id: 10,
    name: 'Grilled Chicken',
    description: 'Tender grilled chicken breast with herbs and spices',
    priceCents: 1900,
    category: { name: 'Chicken' },
    stock: 70,
    availability: 'In Stock',
    image: '/grill chicken.jpg',
    active: true
  },
  {
    id: 11,
    name: 'Coca Cola',
    description: 'Refreshing cola drink',
    priceCents: 300,
    category: { name: 'Beverage' },
    stock: 100,
    availability: 'In Stock',
    image: '/cococola.jpg',
    active: true
  },
  {
    id: 12,
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    priceCents: 400,
    category: { name: 'Beverage' },
    stock: 80,
    availability: 'In Stock',
    image: '/orange juice.jpg',
    active: true
  },
  {
    id: 13,
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon grilled to perfection',
    priceCents: 3500,
    category: { name: 'Seafood' },
    stock: 25,
    availability: 'In Stock',
    image: '/salamon.jpg',
    active: true
  },
  {
    id: 14,
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with chocolate frosting',
    priceCents: 800,
    category: { name: 'Bakery' },
    stock: 30,
    availability: 'In Stock',
    image: '/choclate cake.jpg',
    active: true
  },
  {
    id: 15,
    name: 'Apple Pie',
    description: 'Homemade apple pie with cinnamon and sugar',
    priceCents: 700,
    category: { name: 'Bakery' },
    stock: 35,
    availability: 'In Stock',
    image: '/apple pie.jpg',
    active: true
  }
];

// Get all inventory items - accessible by staff and admin
router.get('/', requireAuth(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    // Disable caching to ensure real-time updates
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json(inventoryItems);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

// Get inventory item by ID - accessible by staff and admin
router.get('/:id', requireAuth(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const item = inventoryItems.find(item => item.id === parseInt(id));
    
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    // Disable caching to ensure real-time updates
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// Update inventory item stock - accessible by staff and admin
router.put('/:id/stock', requireAuth(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }
    
    const itemIndex = inventoryItems.findIndex(item => item.id === parseInt(id));
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    // Update the item
    inventoryItems[itemIndex] = {
      ...inventoryItems[itemIndex],
      stock: stock,
      availability: stock > 0 ? 'In Stock' : 'Out of Stock'
    };
    
    res.json(inventoryItems[itemIndex]);
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    res.status(500).json({ error: 'Failed to update inventory stock' });
  }
});

// Update inventory item availability - accessible by staff and admin
router.put('/:id/availability', requireAuth(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    
    const validStatuses = ['In Stock', 'Out of Stock', 'Low Stock'];
    if (!validStatuses.includes(availability)) {
      return res.status(400).json({ error: 'Invalid availability status' });
    }
    
    const itemIndex = inventoryItems.findIndex(item => item.id === parseInt(id));
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    // Update the item
    inventoryItems[itemIndex] = {
      ...inventoryItems[itemIndex],
      availability: availability
    };
    
    res.json(inventoryItems[itemIndex]);
  } catch (error) {
    console.error('Error updating inventory availability:', error);
    res.status(500).json({ error: 'Failed to update inventory availability' });
  }
});

// Bulk update inventory items - accessible by staff and admin
router.put('/bulk-update', requireAuth(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates must be an array' });
    }
    
    const updatedItems = [];
    
    for (const update of updates) {
      const { id, stock, availability } = update;
      
      const itemIndex = inventoryItems.findIndex(item => item.id === parseInt(id));
      if (itemIndex !== -1) {
        const updatedItem = { ...inventoryItems[itemIndex] };
        
        if (typeof stock === 'number' && stock >= 0) {
          updatedItem.stock = stock;
          updatedItem.availability = stock > 0 ? 'In Stock' : 'Out of Stock';
        }
        
        if (availability) {
          updatedItem.availability = availability;
        }
        
        inventoryItems[itemIndex] = updatedItem;
        updatedItems.push(updatedItem);
      }
    }
    
    res.json(updatedItems);
  } catch (error) {
    console.error('Error bulk updating inventory:', error);
    res.status(500).json({ error: 'Failed to bulk update inventory' });
  }
});

// Get low stock items - accessible by staff and admin
router.get('/alerts/low-stock', requireAuth(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const lowStockThreshold = parseInt(req.query.threshold) || 10;
    const lowStockItems = inventoryItems.filter(item => 
      item.stock <= lowStockThreshold && item.stock > 0
    );
    
    // Disable caching to ensure real-time updates
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// Get out of stock items - accessible by staff and admin
router.get('/alerts/out-of-stock', requireAuth(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const outOfStockItems = inventoryItems.filter(item => item.stock === 0);
    
    // Disable caching to ensure real-time updates
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json(outOfStockItems);
  } catch (error) {
    console.error('Error fetching out of stock items:', error);
    res.status(500).json({ error: 'Failed to fetch out of stock items' });
  }
});

module.exports = router;
