// Inventory synchronization utility
// This helps sync inventory updates across different components

const INVENTORY_UPDATE_EVENT = 'inventoryUpdated';
const INVENTORY_STORAGE_KEY = 'inventoryItems';

// Get inventory items from localStorage
export const getStoredInventoryItems = () => {
  try {
    const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading inventory from localStorage:', error);
    return [];
  }
};

// Store inventory items in localStorage
export const storeInventoryItems = (items) => {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error storing inventory in localStorage:', error);
  }
};

// Emit inventory update event
export const emitInventoryUpdate = (updatedItem) => {
  try {
    // Update localStorage
    const currentItems = getStoredInventoryItems();
    const updatedItems = currentItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    storeInventoryItems(updatedItems);
    
    // Emit custom event
    const event = new CustomEvent(INVENTORY_UPDATE_EVENT, {
      detail: { updatedItem, allItems: updatedItems }
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Error emitting inventory update:', error);
  }
};

// Listen for inventory updates
export const onInventoryUpdate = (callback) => {
  const handleUpdate = (event) => {
    callback(event.detail.updatedItem, event.detail.allItems);
  };
  
  window.addEventListener(INVENTORY_UPDATE_EVENT, handleUpdate);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(INVENTORY_UPDATE_EVENT, handleUpdate);
  };
};

// Initialize inventory from API data
export const initializeInventory = (apiItems) => {
  try {
    storeInventoryItems(apiItems);
  } catch (error) {
    console.error('Error initializing inventory:', error);
  }
};
