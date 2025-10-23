// Performance-optimized API utilities
import apiClient from './apiClient';

class PerformanceAPI {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.retryCount = new Map();
    this.maxRetries = 3;
    this.timeout = 10000; // 10 seconds
  }

  // Clear menu-related cache to ensure fresh data
  clearMenuCache() {
    console.log('🧹 Clearing menu cache to ensure fresh data...');
    this.cache.delete('menu_items');
    this.cache.delete('categories');
    this.pendingRequests.delete('menu_items');
    this.pendingRequests.delete('categories');
  }

  // Enhanced getCurrentUser with caching and retry logic
  async getCurrentUserOptimized() {
    const cacheKey = 'current_user';
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if it's less than 5 minutes old
    if (cached && Date.now() - cached.timestamp < 300000) {
      console.log('Returning cached user data');
      return cached.data;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log('User request already pending, waiting...');
      return this.pendingRequests.get(cacheKey);
    }

    // Create request promise
    const requestPromise = this.makeRequestWithRetry('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then((data) => {
      // Cache successful response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);
      this.retryCount.delete(cacheKey);
      
      return data;
    }).catch((error) => {
      // Remove from pending requests on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    });

    // Add to pending requests
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  // Enhanced menu items without aggressive caching
  async getMenuItemsOptimized() {
    const cacheKey = 'menu_items';
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log('Menu items request already pending, waiting...');
      return this.pendingRequests.get(cacheKey);
    }

    const requestPromise = this.makeRequestWithRetry('/api/menu-items', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then((data) => {
      // Don't cache menu items to ensure fresh data
      this.pendingRequests.delete(cacheKey);
      this.retryCount.delete(cacheKey);
      
      return data;
    }).catch((error) => {
      this.pendingRequests.delete(cacheKey);
      throw error;
    });

    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  // Request with retry logic and timeout
  async makeRequestWithRetry(url, options, requestId = null) {
    const id = requestId || url;
    const retries = this.retryCount.get(id) || 0;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort('Request timeout'), this.timeout);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${url}`, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.retryCount.delete(id);
      return data;

    } catch (error) {
      console.error(`Request failed (attempt ${retries + 1}):`, error);

      // Don't retry on abort errors (timeout or user cancellation)
      if (retries < this.maxRetries && error.name !== 'AbortError') {
        // Exponential backoff
        const delay = Math.pow(2, retries) * 1000;
        this.retryCount.set(id, retries + 1);
        
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.makeRequestWithRetry(url, options, id);
      }

      this.retryCount.delete(id);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
    this.retryCount.clear();
  }

  // Clear specific cache entry
  clearCacheEntry(key) {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
    this.retryCount.delete(key);
  }
}

// Create singleton instance
const performanceAPI = new PerformanceAPI();

export default performanceAPI;
