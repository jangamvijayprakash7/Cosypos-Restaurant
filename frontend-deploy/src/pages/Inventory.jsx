import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Bell } from 'lucide-react';
import { FiEdit3, FiTrash2, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import Sidebar from './Sidebar.jsx';
import HeaderBar from './HeaderBar.jsx';
import InventoryQuickEdit from './InventoryQuickEdit.jsx';
import Toast from '../components/Toast.jsx';
import { useInventoryQuickEdit } from '../hooks/useInventoryQuickEdit.js';
import { getMenuItems } from '../utils/api';
import { useMenuItems, useDataSync } from '../hooks/useDataSync';
import realtimeSync from '../utils/realtimeSync';
import api from '../utils/apiClient';

const colors = { 
  bg: '#111315', 
  text: '#FFFFFF', 
  panel: '#292C2D',
  accent: '#FAC1D9',
  muted: '#777979',
  line: '#3D4142'
}

export default function Inventory() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isOpen: isQuickEditOpen, openModal: openQuickEditModal, closeModal: closeQuickEditModal, handleUpdate: handleQuickEditUpdate } = useInventoryQuickEdit();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Form states for add/edit modals
  const [formData, setFormData] = useState({
    name: '',
    category: 'All',
    quantity: 1,
    stock: 'InStock',
    status: 'Active',
    price: '',
    perishable: 'No',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Categories state - Load from localStorage or use default
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('inventoryCategories');
    return savedCategories ? JSON.parse(savedCategories) : ['Chicken', 'Pizza', 'Burger', 'Beverage'];
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null, title: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Inventory items from database
  const [inventoryItems, setInventoryItems] = useState([]);

  // Toast helper - defined early
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Load menu items on component mount
  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const loadMenuItems = async () => {
      try {
        setIsLoading(true);
        console.log('📥 Loading inventory items...');
        
        // Safety timeout - force exit loading after 45 seconds
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⚠️ Loading timeout - displaying empty list');
            setIsLoading(false);
            showToast('Loading took too long. Please refresh the page.', 'warning');
          }
        }, 45000);
        
        const response = await getMenuItems({ page: 1, limit: 100 }); // Use pagination for faster loading
        const items = response.items || response; // Handle both formats
        
        if (mounted) {
          setInventoryItems(items);
          console.log(`✅ Loaded ${items.length} items`);
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('❌ Error loading menu items:', error);
        if (mounted) {
          showToast('Failed to load inventory items', 'error');
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };
    
    loadMenuItems();
    
    // Initialize real-time synchronization
    realtimeSync.initialize();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Add real-time listeners for Inventory page
  useEffect(() => {
    // Listen for real-time refresh events
    const handleRealtimeRefresh = async () => {
      console.log('🔄 Inventory page real-time refresh triggered');
      try {
        const response = await getMenuItems({ page: 1, limit: 100 }); // Use pagination
        const items = response.items || response; // Handle both formats
        setInventoryItems(items);
      } catch (error) {
        console.error('Error refreshing inventory data:', error);
      }
    };
    
    // Listen for menu items updates
    const handleMenuItemsUpdate = (event) => {
      const { type, data } = event.detail;
      if (type === 'menuItems') {
        setInventoryItems(data);
      }
    };
    
    window.addEventListener('realtime-refresh', handleRealtimeRefresh);
    window.addEventListener('cosypos-data-update', handleMenuItemsUpdate);
    
    return () => {
      window.removeEventListener('realtime-refresh', handleRealtimeRefresh);
      window.removeEventListener('cosypos-data-update', handleMenuItemsUpdate);
    };
  }, []);

  // Debouncing effect for search
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Filter inventory items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      // Status filter - handle both status and availability fields
      const itemStatus = item.availability || item.status;
      const matchesStatus = activeFilter === 'All' || itemStatus === activeFilter;
      
      // Category filter - handle both category formats
      const itemCategory = item.category?.name || item.category;
      const matchesCategory = categoryFilter === 'All' || itemCategory === categoryFilter;
      
      // Stock filter
      const matchesStock = stockFilter === 'All' || item.stock === stockFilter;
      
      // Price range filter - handle both price formats
      const itemPrice = item.priceCents ? item.priceCents / 100 : (item.price || 0);
      const matchesPrice = (!priceRange.min || itemPrice >= parseFloat(priceRange.min)) &&
                          (!priceRange.max || itemPrice <= parseFloat(priceRange.max));
      
      // Search filter - handle both category formats
      const matchesSearch = !debouncedSearchTerm.trim() || 
                           item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase().trim()) ||
                           itemCategory.toLowerCase().includes(debouncedSearchTerm.toLowerCase().trim());
      
      return matchesStatus && matchesCategory && matchesStock && matchesPrice && matchesSearch;
    });
  }, [inventoryItems, activeFilter, categoryFilter, stockFilter, priceRange, debouncedSearchTerm]);

  // Filter counts
  const filterCounts = useMemo(() => {
    return {
      All: inventoryItems.length,
      Active: inventoryItems.filter(item => (item.availability || item.status) === 'Active').length,
      Inactive: inventoryItems.filter(item => (item.availability || item.status) === 'Inactive').length,
      Draft: inventoryItems.filter(item => (item.availability || item.status) === 'Draft').length
    };
  }, [inventoryItems]);

  // Handlers
  const handleAddNewInventory = () => {
    setFormData({
      name: '',
      category: 'All',
      quantity: 1,
      stock: 'InStock',
      status: 'Active',
      price: '',
      perishable: 'No',
      image: null
    });
    setIsAddModalOpen(true);
  };

  // Dialog helper
  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ show: true, title, message, onConfirm });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, message: '', onConfirm: null, title: '' });
  };

  const handleEditItem = (item) => {
    // For staff users, open the quick edit modal
    if (user?.role === 'STAFF') {
      openQuickEditModal();
    } else {
      // For admin users, use the full edit modal
      setEditingItem(item);
      setImagePreview(item.image);
      
      // Extract category name if it's an object
      const categoryName = typeof item.category === 'object' ? item.category.name : item.category;
      
      // Extract price value (remove $ and convert to number)
      const priceValue = typeof item.price === 'string' 
        ? item.price.replace(/[\$,]/g, '') 
        : (item.priceCents ? item.priceCents / 100 : item.price);
      
      setFormData({
        name: item.name,
        category: categoryName,
        quantity: item.stock || item.quantity || 0,
        stock: item.stock,
        status: item.availability === 'In Stock' ? 'Active' : item.status || 'Inactive',
        price: priceValue.toString(),
        perishable: item.perishable || 'No',
        image: item.image,
        description: item.description || ''
      });
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteItem = async (itemId) => {
    // Only admins can delete
    if (user?.role !== 'ADMIN') {
      showToast('Only administrators can delete inventory items', 'error');
      return;
    }

    showConfirmDialog(
      'Delete Inventory Item',
      'Are you sure you want to delete this inventory item? This action cannot be undone.',
      async () => {
        try {
          await api.delete(`/api/menu-items/${itemId}`);
          setInventoryItems(prev => prev.filter(item => item.id !== itemId));
          showToast('Inventory item deleted successfully!', 'success');
          closeConfirmDialog();
          // Trigger real-time sync
          realtimeSync.notifyChange('menu-items');
        } catch (error) {
          console.error('Error deleting item:', error);
          showToast(error.message || 'Failed to delete inventory item', 'error');
          closeConfirmDialog();
        }
      }
    );
  };

  // Category management handlers
  const handleAddCategory = () => {
    // Only admins can add categories
    if (user?.role !== 'ADMIN') {
      showToast('Only administrators can add categories', 'error');
      return;
    }
    setIsAddCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast('Please enter a category name', 'warning');
      return;
    }

    // Only admins can save categories
    if (user?.role !== 'ADMIN') {
      showToast('Only administrators can add categories', 'error');
      return;
    }

    try {
      const categoryData = await api.post('/api/categories', { name: newCategoryName.trim() });
      const updatedCategories = [...categories, newCategoryName.trim()];
      setCategories(updatedCategories);
      localStorage.setItem('inventoryCategories', JSON.stringify(updatedCategories));
      setNewCategoryName('');
      setIsAddCategoryModalOpen(false);
      showToast('Category added successfully!', 'success');
    } catch (error) {
      console.error('Error adding category:', error);
      showToast(error.message || 'Failed to add category', 'error');
    }
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddCategoryModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'All',
      quantity: 1,
      stock: 'InStock',
      status: 'Active',
      price: '',
      perishable: 'No',
      image: null
    });
    setImagePreview(null);
  };


  const handleSaveItem = async () => {
    // Prevent multiple submissions
    if (isSaving) {
      console.log('⏸️ Save already in progress, ignoring...');
      return;
    }

    // Only admins can add/edit inventory items
    if (user?.role !== 'ADMIN') {
      showToast('Only administrators can modify inventory items', 'error');
      return;
    }

    if (!formData.name || !formData.price) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setIsSaving(true);

    try {
      // Ensure category is a string, not an object
      const categoryName = typeof formData.category === 'object' 
        ? formData.category.name 
        : formData.category;

      const itemData = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        category: categoryName, // Always send as string
        stock: parseInt(formData.quantity) || 0,
        availability: formData.status === 'Active' ? 'In Stock' : 'Out of Stock',
        image: formData.image || null
      };

      console.log('💾 Saving item with data:', itemData);

      if (isEditModalOpen && editingItem) {
        // Update existing item
        const updatedItem = await api.put(`/api/menu-items/${editingItem.id}`, itemData);
        setInventoryItems(prev => prev.map(item => 
          item.id === editingItem.id ? updatedItem : item
        ));
        showToast('Inventory item updated successfully!', 'success');
      } else {
        // Add new item
        const newItem = await api.post('/api/menu-items', itemData);
        
        // Only add if it doesn't already exist
        setInventoryItems(prev => {
          const exists = prev.some(item => item.id === newItem.id);
          if (exists) {
            console.log('⚠️ Item already exists, skipping add');
            return prev;
          }
          console.log('✅ Adding new item to list');
          return [newItem, ...prev];
        });
        
        showToast('Inventory item created successfully!', 'success');
      }
      
      handleCloseModals();
      setIsSaving(false);
      
      // Trigger real-time sync after a delay
      setTimeout(() => {
        realtimeSync.notifyChange('menu-items');
      }, 1000);
    } catch (error) {
      console.error('❌ Error saving item:', error);
      showToast(error.message || 'Failed to save inventory item', 'error');
      setIsSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetFilters = () => {
    setActiveFilter('All');
    setSearchTerm('');
    setCategoryFilter('All');
    setStockFilter('All');
    setPriceRange({ min: '', max: '' });
  };

  // Handle updates from quick edit modal
  const handleQuickEditUpdateWrapper = (updatedItem) => {
    // Update the local inventory state
    setInventoryItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    
    // Call the original handler if it exists
    if (handleQuickEditUpdate) {
      handleQuickEditUpdate(updatedItem);
    }
  };

  // Add New Inventory Modal - Render directly to avoid recreation
  const renderAddInventoryModal = () => (
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
          handleCloseModals();
        }
      }}
    >
      <div style={{
        background: colors.panel,
        borderRadius: 10,
        padding: 20,
        maxWidth: 520,
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxSizing: 'border-box',
        border: `1px solid ${colors.accent}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <h2 style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: 600,
            margin: 0
          }}>
            Add New Inventory
          </h2>
          <button
            onClick={handleCloseModals}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.muted,
              fontSize: 22,
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

        {/* Image Upload */}
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <div style={{
            width: 100,
            height: 100,
            background: colors.bg,
            border: `2px dashed ${colors.muted}`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative'
          }}
          onClick={() => document.getElementById('image-upload').click()}
          >
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 6
                }}
              />
            ) : (
              <FiPlus size={28} color={colors.muted} />
            )}
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <button 
            type="button"
            onClick={() => document.getElementById('image-upload').click()}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.accent,
              fontSize: 13,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {imagePreview ? 'Change Image' : 'Upload Image'}
          </button>
        </div>

        {/* Form Fields */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 16,
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {/* Name */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Name
            </label>
            <input
              type="text"
              placeholder="Enter inventory name"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Category */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="All">All</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Quantity
            </label>
            <select
              value={formData.quantity}
              onChange={(e) => handleFormChange('quantity', parseInt(e.target.value))}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              {Array.from({ length: 100 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          {/* Stock */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Stock
            </label>
            <select
              value={formData.stock}
              onChange={(e) => handleFormChange('stock', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="InStock">InStock</option>
              <option value="OutOfStock">OutOfStock</option>
              <option value="LowStock">LowStock</option>
            </select>
          </div>

          {/* Status */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleFormChange('status', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Price */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Price
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter inventory price"
              value={formData.price}
              onChange={(e) => handleFormChange('price', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Perishable */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            color: colors.text,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 8,
            display: 'block'
          }}>
            Perishable
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="perishable"
                value="Yes"
                checked={formData.perishable === 'Yes'}
                onChange={(e) => handleFormChange('perishable', e.target.value)}
                style={{ accentColor: colors.accent }}
              />
              <span style={{ color: colors.text, fontSize: 13 }}>Yes</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="perishable"
                value="No"
                checked={formData.perishable === 'No'}
                onChange={(e) => handleFormChange('perishable', e.target.value)}
                style={{ accentColor: colors.accent }}
              />
              <span style={{ color: colors.text, fontSize: 13 }}>No</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleCloseModals}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.muted}`,
              color: colors.text,
              padding: '10px 20px',
              borderRadius: 6,
              fontSize: 13,
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
            Cancel
          </button>
          <button
            onClick={handleSaveItem}
            disabled={isSaving}
            style={{
              background: isSaving ? colors.muted : colors.accent,
              border: 'none',
              color: isSaving ? '#555' : '#333333',
              padding: '10px 20px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isSaving ? 0.6 : 1
            }}
            onMouseEnter={(e) => !isSaving && (e.target.style.background = '#E8A8C8')}
            onMouseLeave={(e) => !isSaving && (e.target.style.background = colors.accent)}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Inventory Modal - Render directly to avoid recreation
  const renderEditInventoryModal = () => (
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
          handleCloseModals();
        }
      }}
    >
      <div style={{
        background: colors.panel,
        borderRadius: 10,
        padding: 20,
        maxWidth: 520,
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxSizing: 'border-box',
        border: `1px solid ${colors.accent}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <h2 style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: 600,
            margin: 0
          }}>
            Edit New Inventory
          </h2>
          <button
            onClick={handleCloseModals}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.muted,
              fontSize: 22,
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

        {/* Image Display */}
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <div style={{
            width: 100,
            height: 100,
            background: colors.bg,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => document.getElementById('edit-image-upload').click()}
          >
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 6
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: `url('/chicken-parmesan.png') center/cover`,
                borderRadius: 8
              }} />
            )}
          </div>
          <input
            id="edit-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <button 
            type="button"
            onClick={() => document.getElementById('edit-image-upload').click()}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.accent,
              fontSize: 13,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Change Picture
          </button>
        </div>

        {/* Form Fields */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 16
        }}>
          {/* Name */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Category */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="All">All</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Quantity
            </label>
            <select
              value={formData.quantity}
              onChange={(e) => handleFormChange('quantity', parseInt(e.target.value))}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              {Array.from({ length: 100 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          {/* Stock */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Stock
            </label>
            <select
              value={formData.stock}
              onChange={(e) => handleFormChange('stock', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="InStock">InStock</option>
              <option value="OutOfStock">OutOfStock</option>
              <option value="LowStock">LowStock</option>
            </select>
          </div>

          {/* Status */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleFormChange('status', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Price */}
          <div style={{ minWidth: 0 }}>
            <label style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: 'block'
            }}>
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleFormChange('price', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: 10,
                background: colors.bg,
                border: `1px solid ${colors.muted}`,
                borderRadius: 6,
                color: colors.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Perishable */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            color: colors.text,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 8,
            display: 'block'
          }}>
            Perishable
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="perishable"
                value="Yes"
                checked={formData.perishable === 'Yes'}
                onChange={(e) => handleFormChange('perishable', e.target.value)}
                style={{ accentColor: colors.accent }}
              />
              <span style={{ color: colors.text, fontSize: 13 }}>Yes</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="perishable"
                value="No"
                checked={formData.perishable === 'No'}
                onChange={(e) => handleFormChange('perishable', e.target.value)}
                style={{ accentColor: colors.accent }}
              />
              <span style={{ color: colors.text, fontSize: 13 }}>No</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleCloseModals}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.muted}`,
              color: colors.text,
              padding: '10px 20px',
              borderRadius: 6,
              fontSize: 13,
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
            Cancel
          </button>
          <button
            onClick={handleSaveItem}
            disabled={isSaving}
            style={{
              background: isSaving ? colors.muted : colors.accent,
              border: 'none',
              color: isSaving ? '#555' : '#333333',
              padding: '10px 20px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isSaving ? 0.6 : 1
            }}
            onMouseEnter={(e) => !isSaving && (e.target.style.background = '#E8A8C8')}
            onMouseLeave={(e) => !isSaving && (e.target.style.background = colors.accent)}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  // Show loading screen while data is loading
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
        <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative' }}>
          <Sidebar />
          <HeaderBar title="Inventory" showBackButton={true} />
          <main style={{ paddingLeft: 208, paddingRight: 32, paddingTop: 20 }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              height: '60vh',
              gap: 20
            }}>
              <div style={{
                width: 60,
                height: 60,
                border: `4px solid ${colors.muted}`,
                borderTop: `4px solid ${colors.accent}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ color: colors.text, fontSize: 18, fontWeight: 500 }}>
                Loading inventory...
              </div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative', overflowX: 'hidden' }}>
        <Sidebar />
        <HeaderBar title="Inventory" showBackButton={true} right={(
          <>
            {/* Notification Bell Container */}
            <div 
              onClick={() => navigate('/notifications')}
              style={{ 
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {/* Bell Icon */}
              <Bell size={20} color="#FFFFFF" />
              
              {/* Notification Badge */}
              <div style={{ 
                position: 'absolute',
                width: 10.4,
                height: 10.4,
                top: -2,
                right: -2,
                background: colors.accent,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ 
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fontSize: 5.94335,
                  lineHeight: '9px',
                  color: '#333333',
                  textAlign: 'center'
                }}>
                  01
                </span>
              </div>
            </div>

            {/* Separator Line */}
            <div style={{ 
              width: 0,
              height: 22.29,
              border: '0.742918px solid #FFFFFF',
              margin: '0 8px'
            }} />

            {/* User Profile */}
            <div 
              onClick={() => navigate('/profile')}
              style={{ 
                width: 37.15,
                height: 37.15,
                borderRadius: '50%',
                border: '1.48584px solid #FAC1D9',
                background: '#D9D9D9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.borderColor = '#FFB6C1'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.borderColor = '#FAC1D9'
              }}
            >
              <img 
                src={user?.profileImage ? (import.meta.env.DEV ? user.profileImage : `${import.meta.env.VITE_API_URL}${user.profileImage}`) : "/profile img icon.jpg"} 
                alt="Profile" 
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
                onError={(e) => {
                  // Fallback to default image if uploaded image fails to load
                  e.target.src = "/profile img icon.jpg";
                }}
              />
            </div>
          </>
        )} />

        <main className="page-main-content" style={{ 
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 192,
          paddingRight: 16,
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          marginLeft: 0
        }}>
          <div style={{
            display: 'flex',
            gap: 16,
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            overflow: 'hidden',
            alignItems: 'flex-start'
          }}>
            {/* Left Sidebar - Filters */}
            <div style={{
              width: 240,
              minWidth: 240,
              maxWidth: 240,
              background: colors.panel,
              borderRadius: 12,
              padding: 16,
              height: 'fit-content',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}>
            {/* Product Status Filter */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: 600,
                marginBottom: 10
              }}>
                Product Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['All', 'Active', 'Inactive', 'Draft'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveFilter(status)}
                    style={{
                      background: activeFilter === status ? colors.accent : 'transparent',
                      border: 'none',
                      color: activeFilter === status ? '#333333' : colors.text,
                      padding: '12px 16px',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (activeFilter !== status) {
                        e.target.style.background = colors.muted;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeFilter !== status) {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    <span>{status}</span>
                    <span style={{
                      background: activeFilter === status ? '#333333' : colors.muted,
                      color: activeFilter === status ? colors.accent : colors.text,
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {filterCounts[status]}
                    </span>
                  </button>
                ))}
      </div>
    </div>

            {/* Search Filter */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                color: colors.text,
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
                display: 'block'
              }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  padding: 10,
                  background: colors.bg,
                  border: `1px solid ${colors.muted}`,
                  borderRadius: 6,
                  color: colors.text,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{
                  color: colors.text,
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'block'
                }}>
                  Category
                </label>
                {/* Add New Category Button - Only for ADMIN */}
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={handleAddCategory}
                    style={{
                      background: colors.accent,
                      color: '#333333',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
                    onMouseLeave={(e) => e.target.style.background = colors.accent}
                  >
                    + Add
                  </button>
                )}
              </div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  padding: 10,
                  background: colors.bg,
                  border: `1px solid ${colors.muted}`,
                  borderRadius: 6,
                  color: colors.text,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="All">All</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                color: colors.text,
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
                display: 'block'
              }}>
                Stock
              </label>
              <select 
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  padding: 10,
                  background: colors.bg,
                  border: `1px solid ${colors.muted}`,
                  borderRadius: 6,
                  color: colors.text,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="All">All</option>
                <option value="InStock">InStock</option>
                <option value="OutOfStock">OutOfStock</option>
                <option value="LowStock">LowStock</option>
              </select>
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                color: colors.text,
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
                display: 'block'
              }}>
                Price Range
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: 10,
                    background: colors.bg,
                    border: `1px solid ${colors.muted}`,
                    borderRadius: 6,
                    color: colors.text,
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: 10,
                    background: colors.bg,
                    border: `1px solid ${colors.muted}`,
                    borderRadius: 6,
                    color: colors.text,
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Reset Filters Button */}
            <button
              onClick={handleResetFilters}
              style={{
                width: '100%',
                maxWidth: '100%',
                background: colors.accent,
                color: '#333333',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
              onMouseLeave={(e) => e.target.style.background = colors.accent}
            >
              Reset Filters
            </button>
          </div>

          {/* Right Side - Inventory List */}
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 20 
            }}>
              <div>
                <h1 style={{
                  color: colors.text,
                  fontSize: 24,
                  fontWeight: 600,
                  marginBottom: 8
                }}>
                  Inventory
                </h1>
                <p style={{
                  color: colors.muted,
                  fontSize: 16
                }}>
                  {inventoryItems.length} total products
                </p>
              </div>
              
              {/* Add New Inventory Button - Only for ADMIN */}
              {user?.role === 'ADMIN' && (
                <button 
                  onClick={handleAddNewInventory}
                  style={{
                    background: colors.accent,
                    color: '#333333',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
                  onMouseLeave={(e) => e.target.style.background = colors.accent}
                >
                  Add New Inventory
                </button>
              )}
            </div>

            {/* Inventory Items List */}
            <div style={{
              background: colors.panel,
              borderRadius: 12,
              overflow: 'hidden',
              width: '100%',
              maxWidth: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              {filteredItems.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 20px',
                  color: colors.muted,
                  fontSize: 16
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                  <div>No inventory items found</div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>
                    {searchTerm ? `No results for "${searchTerm}"` : 'Try adjusting your filters'}
                  </div>
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <div key={item.id} style={{
                    padding: '16px 20px',
                    borderBottom: index < filteredItems.length - 1 ? `1px solid ${colors.line}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    minWidth: 0,
                    maxWidth: '100%',
                    transition: 'background 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#3D4142'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Product Image */}
                    <div style={{
                      width: 60,
                      height: 60,
                      minWidth: 60,
                      background: colors.bg,
                      borderRadius: 8,
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
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: `url('/chicken-parmesan.png') center/cover`,
                        borderRadius: 8,
                        display: 'none'
                      }} />
                    </div>

                    {/* Product Info */}
                    <div style={{ 
                      flex: 1, 
                      minWidth: 0,
                      overflow: 'hidden' 
                    }}>
                      <h3 style={{
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 4,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.name}
                      </h3>
                      <p style={{
                        color: colors.muted,
                        fontSize: 14,
                        marginBottom: 8,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        Stocked Product: {item.quantity} In Stock
                      </p>
                    </div>

                    {/* Product Details */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      marginRight: 8,
                      flexShrink: 1,
                      minWidth: 150,
                      maxWidth: 200
                    }}>
                      <div style={{ color: colors.muted, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Status: <span style={{ color: colors.text }}>{item.availability || item.status}</span>
                      </div>
                      <div style={{ color: colors.muted, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Category: <span style={{ color: colors.text }}>{item.category?.name || item.category}</span>
                      </div>
                      <div style={{ color: colors.muted, fontSize: 12, whiteSpace: 'nowrap' }}>
                        Price: <span style={{ color: colors.text, fontWeight: 600 }}>${item.priceCents ? (item.priceCents / 100).toFixed(2) : (item.price || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Action Buttons - Role-based access */}
                    <div style={{ 
                      display: 'flex', 
                      gap: 8,
                      flexShrink: 0 
                    }}>
                      {/* Edit Button - Available for ADMIN and STAFF */}
                      {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                        <button
                          onClick={() => handleEditItem(item)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: colors.accent,
                            cursor: 'pointer',
                            padding: 8,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#3D4142'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          title="Edit item"
                        >
                          <FiEdit3 size={20} />
                        </button>
                      )}
                      
                      {/* Delete Button - Only for ADMIN */}
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#F44336',
                            cursor: 'pointer',
                            padding: 8,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#3D4142'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          title="Delete item"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {isAddModalOpen && renderAddInventoryModal()}
      {isEditModalOpen && renderEditInventoryModal()}
      
      {/* Quick Edit Modal for Staff */}
      <InventoryQuickEdit 
        isOpen={isQuickEditOpen}
        onClose={closeQuickEditModal}
        onUpdate={handleQuickEditUpdateWrapper}
        inventoryItems={inventoryItems}
        onInventoryUpdate={handleQuickEditUpdateWrapper}
      />
      
      {isAddCategoryModalOpen && (
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
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModals();
            }
          }}
        >
          <div style={{
            background: colors.panel,
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            width: '90%',
            border: `1px solid ${colors.accent}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <h2 style={{
                color: colors.text,
                fontSize: 20,
                fontWeight: 600,
                margin: 0
              }}>
                Add New Category
              </h2>
              <button
                onClick={handleCloseModals}
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

            <div style={{ marginBottom: 20 }}>
              <label style={{
                color: colors.text,
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 8,
                display: 'block'
              }}>
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
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

            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCloseModals}
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
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                style={{
                  background: colors.accent,
                  border: 'none',
                  color: '#333333',
                  padding: '12px 24px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
                onMouseLeave={(e) => e.target.style.background = colors.accent}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
        onClick={closeConfirmDialog}
        >
          <div 
            style={{
              background: colors.panel,
              borderRadius: '12px',
              padding: '24px',
              width: '400px',
              maxWidth: '90%',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: colors.text
            }}>
              {confirmDialog.title}
            </h3>

            <p style={{
              margin: '0 0 24px 0',
              fontSize: '14px',
              color: colors.muted,
              lineHeight: '1.5'
            }}>
              {confirmDialog.message}
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeConfirmDialog}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: `1px solid ${colors.line}`,
                  borderRadius: '8px',
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.line
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.onConfirm) {
                    confirmDialog.onConfirm()
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: '#DC3545',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(220, 53, 69, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#C82333'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.6)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#DC3545'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.4)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </div>
  );
}