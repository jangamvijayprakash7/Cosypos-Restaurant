import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { getMenuItems, updateMenuItem } from '../utils/api';
import { emitInventoryUpdate } from '../utils/inventorySync';

const colors = { 
  bg: '#111315', 
  text: '#FFFFFF', 
  panel: '#292C2D',
  accent: '#FAC1D9',
  muted: '#777979',
  line: '#3D4142'
}

export default function InventoryQuickEdit({ isOpen, onClose, onUpdate, inventoryItems = [], onInventoryUpdate }) {
  const { user } = useUser();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [updatingItems, setUpdatingItems] = useState(new Set());

  // Only show for staff users
  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    return null;
  }

  useEffect(() => {
    if (isOpen) {
      if (inventoryItems.length > 0) {
        // Use provided inventory items
        setMenuItems(inventoryItems);
        setFilteredItems(inventoryItems);
      } else {
        // Fallback to loading from API
        loadMenuItems();
      }
    }
  }, [isOpen, inventoryItems]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(menuItems);
    }
  }, [searchTerm, menuItems]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getMenuItems({ page: 1, limit: 100 }); // Use pagination for faster loading
      const items = response.items || response; // Handle both formats
      setMenuItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      alert('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (itemId, newStock) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return;

      const updatedItem = {
        ...item,
        stock: parseInt(newStock),
        availability: parseInt(newStock) > 0 ? 'In Stock' : 'Out of Stock'
      };

      await updateMenuItem(itemId, {
        stock: newStock,
        availability: newStock > 0 ? 'In Stock' : 'Out of Stock'
      });
      
      // Update local state
      setMenuItems(prev => prev.map(i => 
        i.id === itemId ? updatedItem : i
      ));
      
      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedItem);
      }
      
      // Notify inventory update callback
      if (onInventoryUpdate) {
        onInventoryUpdate(updatedItem);
      }
      
      // Emit global inventory update event
      emitInventoryUpdate(updatedItem);
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleMarkOutOfStock = async (itemId) => {
    await handleStockUpdate(itemId, 0);
  };

  const handleStockIncrement = async (itemId, currentStock) => {
    await handleStockUpdate(itemId, currentStock + 1);
  };

  const handleStockDecrement = async (itemId, currentStock) => {
    if (currentStock > 0) {
      await handleStockUpdate(itemId, currentStock - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflow: 'hidden',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div style={{
        background: colors.panel,
        borderRadius: 12,
        padding: 24,
        maxWidth: 800,
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxSizing: 'border-box',
        border: `1px solid ${colors.accent}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexShrink: 0
        }}>
          <h2 style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: 600,
            margin: 0
          }}>
            Inventory Quick Edit
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.muted,
              fontSize: 24,
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4
            }}
            onMouseEnter={(e) => e.target.style.color = colors.text}
            onMouseLeave={(e) => e.target.style.color = colors.muted}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 20, flexShrink: 0 }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              background: colors.bg,
              border: `1px solid ${colors.muted}`,
              borderRadius: 6,
              color: colors.text,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Items List */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          border: `1px solid ${colors.line}`,
          borderRadius: 8,
          background: colors.bg
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
              color: colors.muted
            }}>
              Loading items...
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
              color: colors.muted
            }}>
              {searchTerm ? 'No items found' : 'No items available'}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} style={{
                padding: 16,
                borderBottom: `1px solid ${colors.line}`,
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                {/* Item Image */}
                <div style={{
                  width: 50,
                  height: 50,
                  background: colors.panel,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Item Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.name}
                  </h3>
                  <p style={{
                    color: colors.muted,
                    fontSize: 14,
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.category?.name || 'Uncategorized'}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{
                      color: colors.muted,
                      fontSize: 12
                    }}>
                      Current Stock:
                    </span>
                    <span style={{
                      color: item.stock > 0 ? '#4CAF50' : '#F44336',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {item.stock}
                    </span>
                  </div>
                </div>

                {/* Stock Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0
                }}>
                  {/* Decrease Button */}
                  <button
                    onClick={() => handleStockDecrement(item.id, item.stock)}
                    disabled={updatingItems.has(item.id) || item.stock <= 0}
                    style={{
                      background: item.stock <= 0 ? colors.muted : '#F44336',
                      border: 'none',
                      color: '#FFFFFF',
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: item.stock <= 0 || updatingItems.has(item.id) ? 'not-allowed' : 'pointer',
                      opacity: item.stock <= 0 || updatingItems.has(item.id) ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </button>

                  {/* Stock Display */}
                  <div style={{
                    minWidth: 40,
                    textAlign: 'center',
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: 600
                  }}>
                    {updatingItems.has(item.id) ? '...' : item.stock}
                  </div>

                  {/* Increase Button */}
                  <button
                    onClick={() => handleStockIncrement(item.id, item.stock)}
                    disabled={updatingItems.has(item.id)}
                    style={{
                      background: colors.accent,
                      border: 'none',
                      color: '#333333',
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: updatingItems.has(item.id) ? 'not-allowed' : 'pointer',
                      opacity: updatingItems.has(item.id) ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>

                  {/* Out of Stock Button */}
                  <button
                    onClick={() => handleMarkOutOfStock(item.id)}
                    disabled={updatingItems.has(item.id) || item.stock === 0}
                    style={{
                      background: item.stock === 0 ? colors.muted : '#FF9800',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: item.stock === 0 || updatingItems.has(item.id) ? 'not-allowed' : 'pointer',
                      opacity: item.stock === 0 || updatingItems.has(item.id) ? 0.5 : 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.stock === 0 ? 'Out of Stock' : 'Mark Out'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 20,
          paddingTop: 20,
          borderTop: `1px solid ${colors.line}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.muted}`,
              color: colors.text,
              padding: '12px 24px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = colors.muted;
              e.target.style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = colors.text;
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
