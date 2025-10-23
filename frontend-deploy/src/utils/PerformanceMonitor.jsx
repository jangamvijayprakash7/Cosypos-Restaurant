import { useEffect, useRef } from 'react';

// Performance monitoring component
export const PerformanceMonitor = ({ componentName, children }) => {
  const renderCount = useRef(0);
  const renderStart = useRef();

  // Capture render start time before React starts rendering
  renderStart.current = performance.now();
  renderCount.current += 1;

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    
    // Log slow renders (more than 16ms = one frame)
    if (renderTime > 16) {
      console.warn(`🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
    } else if (renderTime > 100) {
      console.error(`🚨 Very slow render: ${componentName} took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
    }  });

  return children;
};

// Web Vitals monitoring
export const WebVitalsMonitor = () => {
  useEffect(() => {
    // Check if PerformanceObserver is supported
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver not supported in this browser');
      return;
    }
    
    // Check supported entry types
    const supportedEntryTypes = PerformanceObserver.supportedEntryTypes || [];
    const desiredTypes = ['largest-contentful-paint', 'first-input', 'layout-shift'];
    const availableTypes = desiredTypes.filter(type => supportedEntryTypes.includes(type));

    if (availableTypes.length === 0) {
      console.warn('No supported entry types for Web Vitals monitoring');
      return;
    }

    let observer;
    try {
      // Monitor Core Web Vitals
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('🎨 LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('⚡ FID:', entry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            if (!entry.hadRecentInput) {
              console.log('📐 CLS:', entry.value);
            }
          }
        }
      });

      observer.observe({ entryTypes: availableTypes });
    } catch (error) {
      console.warn('Failed to initialize PerformanceObserver:', error);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return null;
};

// Memory usage monitoring (Chromium-only) - Optimized
export const MemoryMonitor = ({ 
  enabled = process.env.NODE_ENV === 'development',
  interval = 60000, // Increased to 1 minute to reduce overhead
  logThreshold = 0.8 // Only log when memory usage is high
} = {}) => {
  useEffect(() => {
    // Feature detection for performance.memory (Chromium-only)
    if (!performance.memory) {
      return; // Silently return if not available
    }

    if (!enabled) {
      return;
    }

    let lastLoggedTime = 0;
    const minLogInterval = 30000; // Minimum 30 seconds between logs

    const logMemoryUsage = () => {
      const now = Date.now();
      const memory = performance.memory;
      const used = Math.round(memory.usedJSHeapSize / 1048576);
      const total = Math.round(memory.totalJSHeapSize / 1048576);
      const limit = Math.round(memory.jsHeapSizeLimit / 1048576);
      const usageRatio = used / limit;
      
      // Only log if memory usage is high
      if (usageRatio > logThreshold) {
        console.log(`🧠 Memory: ${used}MB / ${total}MB (limit: ${limit}MB)`);
        
        // Warn if memory usage is high
        if (usageRatio > 0.9) {
          console.warn('⚠️ High memory usage detected!');
        }
      }
    };

    // Log memory usage at specified interval
    const intervalId = setInterval(logMemoryUsage, interval);
    return () => clearInterval(intervalId);
  }, [enabled, interval, logThreshold]);

  return null;
};

// Bundle size monitoring - Optimized
export const BundleSizeMonitor = ({ 
  enabled = process.env.NODE_ENV === 'development',
  slowThreshold = 2000, // Increased threshold to 2 seconds
  largeThreshold = 1000000 // Increased to 1MB
} = {}) => {
  useEffect(() => {
    // Check if PerformanceObserver is supported
    if (typeof PerformanceObserver === 'undefined') {
      return; // Silently return if not supported
    }

    // Check if resource entry type is supported
    const supportedEntryTypes = PerformanceObserver.supportedEntryTypes || [];
    if (!supportedEntryTypes.includes('resource')) {
      return; // Silently return if not supported
    }

    if (!enabled) {
      return;
    }

    let observer;
    const loggedResources = new Set(); // Track logged resources to avoid duplicates

    try {
      // Monitor resource loading times
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const loadTime = entry.responseEnd - entry.startTime;
            const size = entry.transferSize;
            const resourceKey = `${entry.name}-${entry.startTime}`;
            
            // Skip if already logged
            if (loggedResources.has(resourceKey)) {
              continue;
            }
            
            // Log slow resources (only in development)
            if (loadTime > slowThreshold) {
              const sizeKB = size ? Math.round(size/1024) : 'unknown';
              console.warn(`🐌 Slow resource: ${entry.name} took ${loadTime.toFixed(2)}ms (${sizeKB}KB)`);
              loggedResources.add(resourceKey);
            }
            
            // Log large resources
            if (size && size > largeThreshold) {
              console.warn(`📦 Large resource: ${entry.name} is ${Math.round(size/1024)}KB`);
              loggedResources.add(resourceKey);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      // Silently handle errors
      console.warn('BundleSizeMonitor: Performance monitoring not supported', error);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [enabled, slowThreshold, largeThreshold]);

  return null;
};
// Combined performance monitor - Optimized
export const PerformanceDashboard = ({ 
  enabled = process.env.NODE_ENV === 'development' 
} = {}) => {
  if (!enabled) {
    return null;
  }

  return (
    <>
      <WebVitalsMonitor />
      <MemoryMonitor enabled={enabled} />
      <BundleSizeMonitor enabled={enabled} />
    </>
  );
};
