// Custom hook for using centralized data synchronization

import { useState, useEffect } from 'react';
import dataSync from '../utils/dataSync';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial data
    const initialData = dataSync.getData('menuItems');
    setMenuItems(initialData);
    setLoading(false);

    // Subscribe to updates
    const unsubscribe = dataSync.subscribe('menuItems', (updatedItems) => {
      setMenuItems(updatedItems);
    });

    // Listen for global updates
    const handleGlobalUpdate = (event) => {
      if (event.detail.type === 'menuItems') {
        setMenuItems(event.detail.data);
      }
    };

    window.addEventListener('cosypos-data-update', handleGlobalUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('cosypos-data-update', handleGlobalUpdate);
    };
  }, []);

  return { menuItems, loading };
};

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial data
    const initialData = dataSync.getData('categories');
    setCategories(initialData);
    setLoading(false);

    // Subscribe to updates
    const unsubscribe = dataSync.subscribe('categories', (updatedCategories) => {
      setCategories(updatedCategories);
    });

    // Listen for global updates
    const handleGlobalUpdate = (event) => {
      if (event.detail.type === 'categories') {
        setCategories(event.detail.data);
      }
    };

    window.addEventListener('cosypos-data-update', handleGlobalUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('cosypos-data-update', handleGlobalUpdate);
    };
  }, []);

  return { categories, loading };
};

export const useDataSync = () => {
  return {
    updateMenuItem: dataSync.updateMenuItem.bind(dataSync),
    addMenuItem: dataSync.addMenuItem.bind(dataSync),
    removeMenuItem: dataSync.removeMenuItem.bind(dataSync),
    updateCategories: dataSync.updateCategories.bind(dataSync),
    standardizeMenuItem: dataSync.standardizeMenuItem.bind(dataSync),
    broadcastUpdate: dataSync.broadcastUpdate.bind(dataSync)
  };
};
