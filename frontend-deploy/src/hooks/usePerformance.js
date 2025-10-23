import { useCallback, useRef, useEffect, useState } from 'react';

// Performance optimization hook
export const usePerformance = () => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);

  // Track render performance
  const trackRender = useCallback((componentName) => {
    const now = performance.now();
    const renderTime = now - lastRenderTimeRef.current;
    renderCountRef.current += 1;

    if (process.env.NODE_ENV === 'development') {
      if (renderTime > 16) { // More than one frame
        console.warn(`🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms (render #${renderCountRef.current})`);
      }
    }

    lastRenderTimeRef.current = now;
  }, []);

  // Debounce function for performance
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    const debouncedFn = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
    debouncedFn.cancel = () => clearTimeout(timeoutId);
    return debouncedFn;
  }, []);
  // Throttle function for performance
  const throttle = useCallback((func, delay) => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(null, args);
      }
    };
  }, []);

  // Memoize expensive calculations
  const memoize = useCallback((fn, deps) => {
    const cacheRef = useRef(new Map());
    
    return useCallback((...args) => {
      const key = JSON.stringify(args);
      
      if (cacheRef.current.has(key)) {
        return cacheRef.current.get(key);
      }
      
      const result = fn(...args);
      cacheRef.current.set(key, result);
      
      // Clean up cache if it gets too large
      if (cacheRef.current.size > 100) {
        cacheRef.current.clear();
      }
      
      return result;
    }, deps);
  }, []);

  // Optimize re-renders
  const useStableCallback = useCallback((callback) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    
    return useCallback((...args) => {
      return callbackRef.current(...args);
    }, []);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      renderCountRef.current = 0;
      lastRenderTimeRef.current = 0;
    };
  }, []);

  return {
    trackRender,
    debounce,
    throttle,
    memoize,
    useStableCallback
  };
};

// Hook for lazy loading components
export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const inflater = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      inflater.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        inflater.unobserve(elementRef.current);
      }
    };
  }, [threshold, hasLoaded]);

  return { elementRef, isVisible, hasLoaded };
};

// Hook for optimizing API calls
export const useOptimizedApi = () => {
  const requestCacheRef = useRef(new Map());
  const pendingRequestsRef = useRef(new Map());

  const makeRequest = useCallback(async (url, options = {}) => {
    const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;
    
    // Check cache first
    if (options.method === 'GET' && requestCacheRef.current.has(cacheKey)) {
      const cached = requestCacheRef.current.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes
        return cached.data;
      }
    }

    // Check if request is already pending
    if (pendingRequestsRef.current.has(cacheKey)) {
      return pendingRequestsRef.current.get(cacheKey);
    }

    // Make the request
    const requestPromise = fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    }).then((data) => {
      // Cache successful GET requests
      if (options.method === 'GET') {
        requestCacheRef.current.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      
      // Remove from pending requests
      pendingRequestsRef.current.delete(cacheKey);
      
      return data;
    }).catch((error) => {
      // Remove from pending requests on error
      pendingRequestsRef.current.delete(cacheKey);
      throw error;
    });

    // Add to pending requests
    pendingRequestsRef.current.set(cacheKey, requestPromise);
    
    return requestPromise;
  }, []);

  const clearCache = useCallback(() => {
    requestCacheRef.current.clear();
  }, []);

  return { makeRequest, clearCache };
};