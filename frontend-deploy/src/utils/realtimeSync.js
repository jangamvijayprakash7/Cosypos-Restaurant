// Real-time synchronization service for immediate updates
class RealtimeSync {
  constructor() {
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.userOperationInProgress = false;
    this.lastUserOperation = 0;
    this.refreshIntervalId = null;
  }

  // Initialize real-time connection
  async initialize() {
    console.log('🔄 Initializing real-time synchronization...');
    
    // DON'T clear cache on init - let backend caching work!
    // this.clearAllCache(); // DISABLED - was sabotaging performance
    
    // Set up real-time listeners
    this.setupRealtimeListeners();
    
    // DON'T force refresh on init - use cached data!
    // await this.forceRefreshAllData(); // DISABLED
    
    console.log('✅ Real-time synchronization initialized');
  }

  // Clear all cache to ensure fresh data
  clearAllCache() {
    console.log('🧹 Clearing ALL cache for real-time updates...');
    
    // Clear localStorage cache using strict key filtering
    // Only remove keys that match our app's namespace or specific known keys
    const ALLOWED_KEY_PREFIXES = ['cosypos:', 'cosypos_'];
    const EXACT_KEYS_TO_CLEAR = [
      'etag:/api/menu-items',
      'etag:/api/categories',
      'cache:/api/menu-items',
      'cache:/api/categories',
      'cache:/api/orders'
    ];
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      // Check if key matches our strict prefixes or exact keys
      const matchesPrefix = ALLOWED_KEY_PREFIXES.some(prefix => key.startsWith(prefix));
      const isExactMatch = EXACT_KEYS_TO_CLEAR.includes(key);
      
      if (matchesPrefix || isExactMatch) {
        localStorage.removeItem(key);
      }
    });

    // Clear performance API cache
    if (window.performanceAPI) {
      window.performanceAPI.clearMenuCache();
    }

    // Clear dataSync cache
    if (window.dataSync) {
      window.dataSync.clearAllCache();
    }

    // Clear any browser cache if possible
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }

    console.log('✅ ALL cache cleared for real-time updates');
  }

  // Set up real-time listeners (less aggressive)
  setupRealtimeListeners() {
    // DISABLED - These were causing constant cache clears and sabotaging performance
    // The backend now has caching, so we don't need aggressive frontend refresh
    
    // Only refresh on visibility change if page was hidden for more than 5 MINUTES
    let lastHiddenTime = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        lastHiddenTime = Date.now();
      } else if (Date.now() - lastHiddenTime > 300000) { // 5 minutes instead of 30 seconds
        console.log('👁️ Page visible after 5+ minutes - triggering refresh');
        this.forceRefreshAllData();
      }
    });

    // Only refresh on focus if window was blurred for more than 5 MINUTES
    let lastBlurTime = 0;
    window.addEventListener('focus', () => {
      if (Date.now() - lastBlurTime > 300000) { // 5 minutes instead of 30 seconds
        console.log('🎯 Window focused after 5+ minutes - triggering refresh');
        this.forceRefreshAllData();
      }
    });
    
    window.addEventListener('blur', () => {
      lastBlurTime = Date.now();
    });

    // Set up periodic refresh (every 30 minutes) for real-time updates
    // Store the interval ID for cleanup
    this.refreshIntervalId = setInterval(() => {
      console.log('⏰ Periodic real-time refresh (30 minutes)...');
      this.forceRefreshAllData();
    }, 1800000); // 30 minutes instead of 10
  }

  // Cleanup method to clear the refresh interval
  cleanup() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
      console.log('🧹 Real-time sync cleanup: interval cleared');
    }
  }

  // Force refresh all data from backend
  async forceRefreshAllData() {
    // Don't refresh if user operation is in progress or recently completed
    if (this.userOperationInProgress || (Date.now() - this.lastUserOperation < 10000)) {
      console.log('⏸️ Skipping refresh - user operation in progress or recently completed');
      return;
    }
    
    try {
      console.log('🔄 Force refreshing all data for real-time sync...');
      
      // DON'T clear cache - let backend caching work!
      // this.clearAllCache(); // DISABLED - was sabotaging performance
      
      // Trigger data refresh events
      window.dispatchEvent(new CustomEvent('realtime-refresh', {
        detail: { timestamp: Date.now() }
      }));
      
      console.log('✅ All data refreshed for real-time sync');
    } catch (error) {
      console.error('❌ Error refreshing data for real-time sync:', error);
    }
  }

  // Subscribe to real-time updates
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Broadcast real-time updates
  broadcast(key, data) {
    console.log(`📡 Broadcasting real-time update for ${key}:`, data?.length ?? 'N/A', 'items');
    
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in real-time callback:', error);
        }
      });
    }
  }

  // Mark user operation in progress
  startUserOperation() {
    this.userOperationInProgress = true;
    this.lastUserOperation = Date.now();
    console.log('👤 User operation started - pausing auto-refresh');
  }

  // End user operation
  endUserOperation() {
    this.userOperationInProgress = false;
    console.log('👤 User operation ended - resuming auto-refresh');
  }

  // Force immediate update across all components
  forceImmediateUpdate(key, data) {
    console.log(`⚡ Force immediate real-time update for ${key}`);
    
    // Mark as user operation
    this.startUserOperation();
    
    // Update data immediately
    this.broadcast(key, data);
    
    // Force re-render across all components
    window.dispatchEvent(new CustomEvent('force-rerender', {
      detail: { key, data, timestamp: Date.now() }
    }));
    
    // End user operation after a delay
    setTimeout(() => {
      this.endUserOperation();
    }, 5000); // 5 seconds delay
  }

  // Notify about a data change (for triggering refreshes after mutations)
  notifyChange(key) {
    console.log(`📢 Data change notification for: ${key}`);
    
    // DON'T clear cache - backend will handle cache invalidation
    // this.clearAllCache(); // DISABLED - let backend caching work
    
    // Broadcast change event
    window.dispatchEvent(new CustomEvent('data-changed', {
      detail: { key, timestamp: Date.now() }
    }));
    
    // Don't force refresh - let the page naturally refresh when needed
    // This prevents excessive API calls
  }
}

// Create global instance
const realtimeSync = new RealtimeSync();

// Initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    realtimeSync.initialize();
  });
}

export default realtimeSync;
