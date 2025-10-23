// Optimized API client with caching and error handling
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    this.cache = new Map();
    this.requestQueue = new Map();
    this.defaultTimeout = 30000; // 30 seconds (increased for slow connections)
  }

  // Create a cache key from URL and options
  getCacheKey(url, options = {}) {
    const method = options.method || 'GET';
    // Use raw string if body is already a string, otherwise stringify
    let body = '';
    if (options.body) {
      body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }
    return `${method}:${url}:${body}`;
  }

  // Check if request is cached and not expired
  getFromCache(cacheKey, maxAge = 300000) { // 5 minutes default
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }

  // Store response in cache
  setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Create fetch request with timeout
  async fetchWithTimeout(url, options = {}, timeout = this.defaultTimeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Don't set Content-Type for FormData - let browser set it with boundary
      const headers = { ...options.headers };
      
      // Check for Content-Type case-insensitively
      const hasContentType = Object.keys(headers).some(
        key => key.toLowerCase() === 'content-type'
      );
      
      // Only set Content-Type to JSON if not already set and body is not FormData
      if (!hasContentType && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }
  // Main request method with caching and deduplication
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint, options);
    const method = options.method || 'GET';

    // DISABLE caching for all data endpoints to ensure real-time updates
    // Only cache static/configuration endpoints
    const staticEndpoints = ['/api/health', '/api/test', '/api/cors-test'];
    const shouldCache = staticEndpoints.some(e => endpoint.includes(e));

    // Check cache ONLY for static endpoints
    if (method === 'GET' && shouldCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check if same request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token && !options.headers?.Authorization) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      };
    }

    // Add cache-busting headers only for non-static endpoints
    if (!shouldCache) {
      options.headers = {
        ...options.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
    }
    // Create request promise with custom timeout if provided
    const timeout = options.timeout || this.defaultTimeout;
    const requestPromise = this.fetchWithTimeout(url, options, timeout)
      .then(async (response) => {
        // Remove from queue
        this.requestQueue.delete(cacheKey);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Only cache static endpoints
        if (method === 'GET' && shouldCache) {
          this.setCache(cacheKey, data);
        }

        // Clear cache after mutations to ensure fresh data on next fetch
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          this.clearCache();
          console.log('🧹 Cache cleared after mutation:', method, endpoint);
        }

        return data;
      })
      .catch((error) => {
        // Remove from queue on error
        this.requestQueue.delete(cacheKey);
        console.error(`API request failed: ${endpoint}`, error);
        throw error;
      });

    // Add to queue
    this.requestQueue.set(cacheKey, requestPromise);

    return requestPromise;
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    // Increase timeout for POST requests (creating items may be slower)
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      timeout: 30000 // 30 seconds for POST
    });
  }

  async put(endpoint, data, options = {}) {
    // Increase timeout for PUT requests (updating items may be slower)
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      timeout: 30000 // 30 seconds for PUT
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Upload method for file uploads
  async upload(endpoint, formData, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      body: formData,
      headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    }, 30000); // 30 second timeout for uploads

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;