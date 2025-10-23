export async function login(email, password) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  try {
    const r = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!r.ok) {
      // Try to get error message from response
      let errorMessage = 'Login failed';
      try {
        const errorData = await r.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status-based messages
        switch (r.status) {
          case 401:
            errorMessage = 'Invalid email or password';
            break;
          case 403:
            errorMessage = 'Access denied';
            break;
          case 404:
            errorMessage = 'Login service not found';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
          case 503:
            errorMessage = 'Service unavailable. Please try again later';
            break;
          default:
            errorMessage = `Login failed (Error ${r.status})`;
        }
      }
      const error = new Error(errorMessage);
      error.status = r.status;
      throw error;
    }
    
    return r.json();
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const netError = new Error('Network error. Please check your internet connection');
      netError.isNetworkError = true;
      throw netError;
    }
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout. Please try again');
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    
    // Re-throw other errors
    throw error;
  }
}

export async function getCurrentUser() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('Request timeout'), 10000); // 10 second timeout
  
  try {
    const r = await fetch(base + '/api/auth/me', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!r.ok) throw new Error('Failed to get user info');
    return r.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

export async function updateProfile(profileData) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  const r = await fetch(base + '/api/auth/profile', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData),
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to update profile');
  }
  return r.json();
}

export async function uploadProfileImage(imageFile) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  const formData = new FormData();
  formData.append('profileImage', imageFile);
  
  const r = await fetch(base + '/api/profile-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to upload image');
  }
  return r.json();
}

// Order API functions
export async function getOrders(options = {}) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  // Support pagination
  const { page, limit, all = true } = options;
  
  // Build query params
  const params = new URLSearchParams();
  if (all) {
    params.append('all', 'true'); // Get all orders for backward compatibility
  } else {
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
  }
  
  const queryString = params.toString();
  const url = `${base}/api/orders${queryString ? '?' + queryString : ''}`;
  
  const headers = {
    'Content-Type': 'application/json',
    // Use ETags for better caching
    'If-None-Match': sessionStorage.getItem('orders-etag') || ''
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const r = await fetch(url, {
    method: 'GET',
    headers
  });
  
  // Handle 304 Not Modified
  if (r.status === 304) {
    const cached = sessionStorage.getItem('orders-cache');
    if (cached) {
      console.log('📦 Using cached orders (304 Not Modified)');
      return JSON.parse(cached);
    }
  }

  if (!r.ok) {
    const error = await r.json().catch(() => ({ error: 'Failed to fetch orders' }));
    throw new Error(error.error || 'Failed to fetch orders');
  }
  
  // Save ETag for future requests
  const etag = r.headers.get('ETag');
  if (etag) {
    sessionStorage.setItem('orders-etag', etag);
  }
  
  const data = await r.json();
  
  // Cache the response
  sessionStorage.setItem('orders-cache', JSON.stringify(data));
  
  return data;
}

export async function createOrder(orderData) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + '/api/orders', {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData)
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to create order');
  }
  return r.json();
}

export async function updateOrder(orderId, orderData) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + '/api/orders/' + orderId, {
    method: 'PUT',
    headers,
    body: JSON.stringify(orderData)
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to update order');
  }
  return r.json();
}

export async function deleteOrder(orderId) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + '/api/orders/' + orderId, {
    method: 'DELETE',
    headers
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to delete order');
  }
  return r.json();
}

export async function getMenuItems(options = {}) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  // Support pagination and optimization options
  // Default to pagination for better performance
  const { page = 1, limit = 50, all = false } = options;
  
  // Build query params
  const params = new URLSearchParams();
  if (all) {
    params.append('all', 'true'); // Get all items only when explicitly requested
  } else {
    params.append('page', page);
    params.append('limit', limit);
  }
  
  const queryString = params.toString();
  const url = `${base}/api/menu-items${queryString ? '?' + queryString : ''}`;
  
  const headers = {
    'Content-Type': 'application/json',
    // Use ETags for better caching
    'If-None-Match': sessionStorage.getItem('menu-items-etag') || ''
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const r = await fetch(url, {
    method: 'GET',
    headers
  });
  
  // Handle 304 Not Modified (cached response)
  if (r.status === 304) {
    const cached = sessionStorage.getItem('menu-items-cache');
    if (cached) {
      console.log('📦 Using cached menu items (304 Not Modified)');
      return JSON.parse(cached);
    }
  }

  if (!r.ok) {
    const error = await r.json().catch(() => ({ error: 'Failed to fetch menu items' }));
    throw new Error(error.error || 'Failed to fetch menu items');
  }
  
  // Save ETag for future requests
  const etag = r.headers.get('ETag');
  if (etag) {
    sessionStorage.setItem('menu-items-etag', etag);
  }
  
  const data = await r.json();
  
  // Cache the response
  sessionStorage.setItem('menu-items-cache', JSON.stringify(data));
  
  // Handle both paginated and non-paginated responses
  // If response has 'items' property, it's paginated
  // For backward compatibility, if 'all=true' was used, return flat array
  if (all && Array.isArray(data)) {
    return data;
  }
  
  return data;
}

/**
 * Get ALL menu items (loads all pages automatically)
 * This is smart - it loads first page fast, then loads rest in background
 */
export async function getAllMenuItems() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  // First, get the first page quickly
  const firstPage = await getMenuItems({ page: 1, limit: 50 });
  
  // If it's a flat array (old API), return it
  if (Array.isArray(firstPage)) {
    return firstPage;
  }
  
  // If we have all items in first page, return them
  if (!firstPage.pagination || !firstPage.pagination.hasMore) {
    return firstPage.items;
  }
  
  // Load remaining pages in parallel
  const totalPages = firstPage.pagination.totalPages;
  const remainingPages = [];
  
  for (let page = 2; page <= Math.min(totalPages, 10); page++) {
    remainingPages.push(getMenuItems({ page, limit: 50 }));
  }
  
  const restOfPages = await Promise.all(remainingPages);
  const allItems = [
    ...firstPage.items,
    ...restOfPages.flatMap(pageData => pageData.items || [])
  ];
  
  return allItems;
}

export async function updateMenuItem(menuItemId, menuItemData) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log('🌐 API: Updating menu item', menuItemId, 'with data:', menuItemData)
  
  const r = await fetch(base + '/api/menu-items/' + menuItemId, {
    method: 'PUT',
    headers,
    body: JSON.stringify(menuItemData)
  });
  
  if (!r.ok) {
    const error = await r.json();
    console.error('❌ API: Update failed:', error)
    throw new Error(error.error || 'Failed to update menu item');
  }
  
  const result = await r.json();
  console.log('✅ API: Update successful, response:', result)
  return result;
}

export async function createMenuItem(menuItemData) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + '/api/menu-items', {
    method: 'POST',
    headers,
    body: JSON.stringify(menuItemData)
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to create menu item');
  }
  return r.json();
}

export async function deleteMenuItem(menuItemId) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const r = await fetch(base + '/api/menu-items/' + menuItemId, {
      method: 'DELETE',
      headers
    });
    
    if (!r.ok) {
      const errorData = await r.json().catch(() => ({ error: 'Unknown error' }));
      if (r.status === 404) {
        throw new Error('Menu item not found - the item may have already been deleted or the data is out of sync');
      }
      throw new Error(errorData.error || `Failed to delete menu item (${r.status})`);
    }
    return r.json();
  } catch (error) {
    console.error('Delete menu item error:', error);
    throw error;
  }
}

// Category API functions
export async function getCategories() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    // Use ETags for better caching
    'If-None-Match': sessionStorage.getItem('categories-etag') || ''
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + '/api/categories', {
    method: 'GET',
    headers
  });
  
  // Handle 304 Not Modified
  if (r.status === 304) {
    const cached = sessionStorage.getItem('categories-cache');
    if (cached) {
      console.log('📦 Using cached categories (304 Not Modified)');
      return JSON.parse(cached);
    }
  }
  
  if (!r.ok) {
    const error = await r.json().catch(() => ({ error: 'Failed to fetch categories' }));
    throw new Error(error.error || 'Failed to fetch categories');
  }
  
  // Save ETag for future requests
  const etag = r.headers.get('ETag');
  if (etag) {
    sessionStorage.setItem('categories-etag', etag);
  }
  
  const data = await r.json();
  
  // Cache the response
  sessionStorage.setItem('categories-cache', JSON.stringify(data));
  
  return data;
}

export async function createCategory(categoryData) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + '/api/categories', {
    method: 'POST',
    headers,
    body: JSON.stringify(categoryData)
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to create category');
  }
  return r.json();
}

export async function updateCategory(categoryId, categoryData) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + '/api/categories/' + categoryId, {
    method: 'PUT',
    headers,
    body: JSON.stringify(categoryData)
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to update category');
  }
  return r.json();
}

export async function deleteCategory(categoryId, force = false) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${base}/api/categories/${categoryId}${force ? '?force=true' : ''}`;
  
  const r = await fetch(url, {
    method: 'DELETE',
    headers
  });
  
  if (!r.ok) {
    const errorData = await r.json();
    // Create enhanced error object with details
    const error = new Error(errorData.error || 'Failed to delete category');
    error.details = errorData.details; // Include item details if available
    throw error;
  }
  return r.json();
}

// Image upload functions
export async function uploadCategoryImage(imageFile) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  const formData = new FormData();
  formData.append('categoryImage', imageFile);
  
  const r = await fetch(base + '/api/category-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to upload category image');
  }
  return r.json();
}

export async function uploadMenuItemImage(imageFile) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  const formData = new FormData();
  formData.append('menuItemImage', imageFile);
  
  const r = await fetch(base + '/api/menu-item-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to upload menu item image');
  }
  return r.json();
}

// Reservation API functions
export async function getReservations() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const r = await fetch(base + '/api/reservations', {
    method: 'GET',
    headers
  });

  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to fetch reservations');
  }
  return r.json();
}

export async function getReservationsByDateFloor(date, floor) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const r = await fetch(base + `/api/reservations/by-date-floor?date=${date}&floor=${floor}`, {
    method: 'GET',
    headers
  });

  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to fetch reservations');
  }
  return r.json();
}

export async function createReservation(reservationData) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const r = await fetch(base + '/api/reservations', {
    method: 'POST',
    headers,
    body: JSON.stringify(reservationData)
  });

  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to create reservation');
  }
  return r.json();
}

export async function updateReservation(id, reservationData) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const r = await fetch(base + `/api/reservations/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(reservationData)
  });

  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to update reservation');
  }
  return r.json();
}

export async function deleteReservation(id) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const r = await fetch(base + `/api/reservations/${id}`, {
    method: 'DELETE',
    headers
  });

  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to delete reservation');
  }
  return r.json();
}

export async function getAvailableTables(date, startTime, endTime, floor) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const r = await fetch(base + `/api/reservations/available-tables?date=${date}&startTime=${startTime}&endTime=${endTime}&floor=${floor}`, {
    method: 'GET',
    headers
  });

  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to fetch available tables');
  }
  return r.json();
}

// Inventory API functions
export async function getInventoryItems() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + '/api/inventory', {
    method: 'GET',
    headers
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to fetch inventory items');
  }
  return r.json();
}

export async function updateInventoryStock(itemId, stock) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + `/api/inventory/${itemId}/stock`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ stock })
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to update inventory stock');
  }
  return r.json();
}

export async function updateInventoryAvailability(itemId, availability) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + `/api/inventory/${itemId}/availability`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ availability })
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to update inventory availability');
  }
  return r.json();
}

export async function bulkUpdateInventory(updates) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + '/api/inventory/bulk-update', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ updates })
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to bulk update inventory');
  }
  return r.json();
}

export async function getLowStockItems(threshold = 10) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + `/api/inventory/alerts/low-stock?threshold=${threshold}`, {
    method: 'GET',
    headers
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to fetch low stock items');
  }
  return r.json();
}

export async function getOutOfStockItems() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const r = await fetch(base + '/api/inventory/alerts/out-of-stock', {
    method: 'GET',
    headers
  });
  
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to fetch out of stock items');
  }
  return r.json();
}

// ============================================================================
// Image Optimization Utilities
// ============================================================================

/**
 * Get optimized image URL with size parameter
 * @param {string} imagePath - The image path from API (e.g., /uploads/menu-items/...)
 * @param {string} size - Size preset: 'thumbnail', 'small', 'medium', 'large', 'original'
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(imagePath, size = 'medium') {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  if (!imagePath) {
    return '/placeholder-food.jpg'; // Default placeholder
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a local asset, return as is
  if (imagePath.startsWith('/') && !imagePath.startsWith('/uploads')) {
    return imagePath;
  }
  
  // Build optimized URL with size parameter
  const fullUrl = imagePath.startsWith('/') ? `${base}${imagePath}` : `${base}/${imagePath}`;
  return `${fullUrl}?size=${size}`;
}

/**
 * Preload an image to improve perceived performance
 * @param {string} imageUrl - The image URL to preload
 */
export function preloadImage(imageUrl) {
  const img = new Image();
  img.src = imageUrl;
}

/**
 * Clear all API caches (useful after logout or data changes)
 */
export function clearApiCache() {
  const cacheKeys = [
    'menu-items-cache',
    'menu-items-etag',
    'orders-cache',
    'orders-etag',
    'categories-cache',
    'categories-etag'
  ];
  
  cacheKeys.forEach(key => sessionStorage.removeItem(key));
  console.log('🗑️ API cache cleared');
}
