// Centralized data synchronization system for real-time updates across all pages

class DataSync {
  constructor() {
    this.listeners = new Map();
    this.data = {
      menuItems: [],
      categories: [],
      orders: [],
      inventory: []
    };
  }

  // Subscribe to data changes
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Update data and notify all listeners IMMEDIATELY
  updateData(key, newData) {
    console.log(`🔄 Updating ${key} data immediately:`, newData.length || 'N/A', 'items');
    
    this.data[key] = newData;
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newData);
        } catch (error) {
          console.error('Error in data sync callback:', error);
        }
      });
    }
    
    // Force immediate update
    this.forceImmediateUpdate(key, newData);
  }

  // Force immediate update for real-time sync
  forceImmediateUpdate(key, newData) {
    // Dispatch custom event for immediate updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cosypos-immediate-update', {
        detail: { key, data: newData, timestamp: Date.now() }
      }));
    }
  }

  // Get current data
  getData(key) {
    return this.data[key] || [];
  }

  // Update specific item in menu items
  updateMenuItem(itemId, updatedItem) {
    const menuItems = [...this.data.menuItems];
    const index = menuItems.findIndex(item => item.id === itemId || item.apiId === itemId);
    
    if (index !== -1) {
      menuItems[index] = { ...menuItems[index], ...updatedItem };
      this.updateData('menuItems', menuItems);
    }
  }

  // Add new menu item
  addMenuItem(newItem) {
    const menuItems = [...this.data.menuItems, newItem];
    this.updateData('menuItems', menuItems);
  }

  // Remove menu item
  removeMenuItem(itemId) {
    const menuItems = this.data.menuItems.filter(item => item.id !== itemId && item.apiId !== itemId);
    this.updateData('menuItems', menuItems);
  }

  // Update category data
  updateCategories(categories) {
    this.updateData('categories', categories);
  }

  // Update specific category
  updateCategory(categoryId, updatedCategory) {
    const categories = [...this.data.categories];
    const index = categories.findIndex(cat => cat.id === categoryId);
    
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updatedCategory };
      this.updateData('categories', categories);
    }
  }

  // Add new category
  addCategory(newCategory) {
    const categories = [...this.data.categories, newCategory];
    this.updateData('categories', categories);
  }

  // Remove category
  removeCategory(categoryId) {
    const categories = this.data.categories.filter(cat => cat.id !== categoryId);
    this.updateData('categories', categories);
  }

  // Standardize menu item format
  standardizeMenuItem(item) {
    return {
      id: item.id || `#${item.apiId || Date.now()}`,
      apiId: item.apiId || item.id,
      name: item.name || '',
      description: item.description || '',
      image: this.getStandardizedImage(item),
      stock: parseInt(item.stock) || 0,
      category: typeof item.category === 'string' ? item.category : item.category?.name || 'Other',
      price: this.getStandardizedPrice(item),
      availability: item.availability || 'In Stock',
      active: item.active !== false
    };
  }

  // Get standardized image based on item name
  getStandardizedImage(item) {
    // PRIORITY 1: Use uploaded image if it exists and is valid (but not default-food.png)
    if (item.image && (item.image.startsWith('/') || item.image.startsWith('http')) && !item.image.includes('default-food.png')) {
      return item.image;
    }

    // PRIORITY 2: Check for locally stored image
    if (item.apiId) {
      const imageKey = `menu_item_image_${item.apiId}`;
      const localImage = localStorage.getItem(imageKey);
      if (localImage) {
        return localImage;
      }
    }

    // PRIORITY 3: Use hardcoded fallback images only if no uploaded image
    const imageMap = {
      // Pizza items
      'Margherita Pizza': '/pizza.jpg',
      'Pepperoni Pizza': '/pizza.jpg',
      'BBQ Chicken Pizza': '/pizza.jpg',
      'Veggie Supreme Pizza': '/pizza.jpg',
      
      // Burger items
      'Classic Burger': '/burger.jpg',
      'Chicken Burger': '/burger.jpg',
      'Cheeseburger': '/burger.jpg',
      'Bacon Burger': '/burger.jpg',
      'Beef Burger': '/burger.jpg',
      
      // Chicken items
      'Chicken Parmesan': '/chicken-parmesan.png',
      'Grilled Chicken': '/grill chicken.jpg',
      'Chicken Wings': '/grill chicken.jpg',
      'Roasted Chicken': '/grill chicken.jpg',
      'Roasted Chickens': '/grill chicken.jpg',
      
      // Beverage items
      'Coca Cola': '/cococola.jpg',
      'Fresh Orange Juice': '/orange juice.jpg',
      'Fresh Juice': '/orange juice.jpg',
      'Coffee': '/cococola.jpg',
      
      // Seafood items
      'Grilled Salmon': '/salamon.jpg',
      'Fish & Chips': '/salamon.jpg',
      
      // Bakery items
      'Chocolate Cake': '/choclate cake.jpg',
      'Apple Pie': '/apple pie.jpg',
      'Apple Honey Pie': '/apple pie.jpg'
    };

    const specificImage = imageMap[item.name];
    if (specificImage) {
      return specificImage;
    }

    // Default fallback
    return '/placeholder-food.jpg';
  }

  // Clear cached images that might be causing issues
  clearCachedImages() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('menu_item_image_') || key.includes('default-food')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Clear all cached data (lightweight version)
  clearAllCache() {
    console.log('🧹 Clearing cached data...');
    
    // Only clear specific cache keys, not everything
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('menu_item_') || key.startsWith('category_') || key.includes('cosypos_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Reset internal data
    this.data = {
      menuItems: [],
      categories: [],
      orders: [],
      inventory: []
    };
    
    // Clear any pending requests
    if (this.pendingRequests) {
      this.pendingRequests.clear();
    }
    
    // Clear any cached images
    this.clearCachedImages();
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && window.gc) {
      window.gc();
    }
    
    console.log('✅ All cached data cleared');
  }

  // Force refresh all data from backend
  async forceRefreshAll() {
    console.log('🔄 Force refreshing all data from backend...');
    
    try {
      // Clear cache first
      this.clearAllCache();
      
      // Trigger refresh event
      window.dispatchEvent(new CustomEvent('cosypos-force-refresh', {
        detail: { timestamp: Date.now() }
      }));
      
      return true;
    } catch (error) {
      console.error('Error force refreshing data:', error);
      return false;
    }
  }


  // Get standardized price format
  getStandardizedPrice(item) {
    if (item.price) {
      // If price is already formatted (e.g., "$25.00")
      if (typeof item.price === 'string' && item.price.startsWith('$')) {
        return item.price;
      }
      // If price is in cents
      if (item.priceCents) {
        return `$${(item.priceCents / 100).toFixed(2)}`;
      }
      // If price is a number
      if (typeof item.price === 'number') {
        return `$${item.price.toFixed(2)}`;
      }
    }
    return '$0.00';
  }

  // Calculate category counts
  calculateCategoryCounts(categories, menuItems) {
    return categories.map(category => {
      if (category.id === 'all') {
        return {
          ...category,
          count: menuItems.length
        };
      } else {
        const count = menuItems.filter(item => {
          const itemCategory = typeof item.category === 'string' ? item.category : item.category?.name;
          return itemCategory?.toLowerCase() === category.name.toLowerCase();
        }).length;
        return {
          ...category,
          count: count
        };
      }
    });
  }

  // Broadcast update to all components
  broadcastUpdate(type, data) {
    // Update internal data
    this.updateData(type, data);
    
    // REMOVED: Don't persist to localStorage to avoid stale data
    // Clear any existing localStorage cache for this type
    localStorage.removeItem(`cosypos_${type}`);
    
    // Trigger custom event for cross-component communication
    window.dispatchEvent(new CustomEvent('cosypos-data-update', {
      detail: { type, data, timestamp: Date.now() }
    }));
  }
  
  // Trigger refetch after mutation
  triggerRefetch(type) {
    console.log(`🔄 Triggering refetch for ${type}`);
    window.dispatchEvent(new CustomEvent('cosypos-refetch-required', {
      detail: { type, timestamp: Date.now() }
    }));
  }
}

// Create singleton instance
const dataSync = new DataSync();

export default dataSync;
