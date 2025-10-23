import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { getOrders, createOrder, updateOrder, getMenuItems } from '../utils/api';
import { useMenuItems, useDataSync } from '../hooks/useDataSync';
import realtimeSync from '../utils/realtimeSync';
import Sidebar from './Sidebar.jsx'
import HeaderBar from './HeaderBar.jsx'
import Payment from './Payment.jsx'
import Categories from './Categories.jsx'
import Toast from '../components/Toast.jsx'

const colors = { 
  bg: '#111315', 
  text: '#FFFFFF', 
  panel: '#292C2D',
  accent: '#FAC1D9',
  muted: '#777979'
}

// Memoized Search Bar (top-level to keep component identity stable)
const SearchBar = React.memo(({ searchTerm, onSearchChange, isSearching, onClear }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    // Keep focus while typing so the user doesn't need to re-select the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchTerm]);

  return (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    background: colors.panel,
    borderRadius: 8,
    padding: '8px 16px',
    marginRight: 16,
    minWidth: 300,
    position: 'relative'
  }}>
    <input
      ref={inputRef}
      type="text"
      placeholder="Search a name, order or etc"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      style={{
        background: 'transparent',
        border: 'none',
        color: colors.text,
        fontSize: 14,
        outline: 'none',
        flex: 1,
        width: '100%'
      }}
    />
    {searchTerm ? (
      <button
        onClick={onClear}
        style={{
          background: 'transparent',
          border: 'none',
          color: colors.muted,
          cursor: 'pointer',
          fontSize: 16,
          padding: 4,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.target.style.color = colors.text}
        onMouseLeave={(e) => e.target.style.color = colors.muted}
        title="Clear search"
      >
        ×
      </button>
    ) : isSearching ? (
      <div style={{ 
        color: colors.accent, 
        fontSize: 16,
        animation: 'spin 1s linear infinite'
      }}>
        ⟳
      </div>
    ) : (
      <div style={{ color: colors.muted, fontSize: 16 }}>🔍</div>
    )}
  </div>
)});

// Food Category Icons (from Menu page)
function PizzaIcon({ color = colors.accent }) {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pizza base - white color */}
      <circle cx="50" cy="50" r="45" fill="#FFFFFF" />
      
      {/* Pizza slice cut lines */}
      <path d="M50 5 L50 95" stroke={color} strokeWidth="2" />
      <path d="M5 50 L95 50" stroke={color} strokeWidth="2" />
      <path d="M15.36 15.36 L84.64 84.64" stroke={color} strokeWidth="2" />
      <path d="M84.64 15.36 L15.36 84.64" stroke={color} strokeWidth="2" />
      
      {/* Toppings positioned according to your specifications - pink color */}
      <circle cx="35" cy="25" r="6" fill={color} />
      <circle cx="65" cy="25" r="6" fill={color} />
      <ellipse cx="30" cy="45" rx="5" ry="3" fill={color} />
      <circle cx="70" cy="45" r="5" fill={color} />
      <circle cx="20" cy="50" r="4" fill={color} />
      <circle cx="80" cy="50" r="5" fill={color} />
      <ellipse cx="35" cy="70" rx="4" ry="3" fill={color} />
      <circle cx="65" cy="70" r="5" fill={color} />
      <circle cx="40" cy="80" r="3" fill={color} />
      <circle cx="60" cy="80" r="4" fill={color} />
      <ellipse cx="25" cy="85" rx="3" ry="2" fill={color} />
      <circle cx="75" cy="85" r="3" fill={color} />
    </svg>
  )
}

function BurgerIcon({ color = colors.accent }) {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bottom bun */}
      <ellipse cx="50" cy="70" rx="35" ry="15" fill="#FFFFFF" />
      
      {/* Patty */}
      <ellipse cx="50" cy="55" rx="30" ry="8" fill={color} />
      
      {/* Cheese */}
      <ellipse cx="50" cy="45" rx="28" ry="6" fill="#FFFFFF" />
      
      {/* Lettuce */}
      <path d="M25 40 Q35 35 45 40 Q55 35 65 40 Q75 35 85 40" stroke={color} strokeWidth="4" fill="none" />
      
      {/* Tomato */}
      <circle cx="40" cy="35" r="4" fill={color} />
      <circle cx="60" cy="35" r="4" fill={color} />
      
      {/* Top bun */}
      <ellipse cx="50" cy="25" rx="32" ry="12" fill="#FFFFFF" />
    </svg>
  )
}

function ChickenIcon({ color = colors.accent }) {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chicken body */}
      <ellipse cx="50" cy="50" rx="30" ry="25" fill={color} />
      
      {/* Chicken head */}
      <circle cx="50" cy="30" r="18" fill={color} />
      
      {/* Beak */}
      <polygon points="50,20 45,15 55,15" fill="#FFFFFF" />
      
      {/* Eye */}
      <circle cx="45" cy="25" r="3" fill="#FFFFFF" />
      
      {/* Wings */}
      <ellipse cx="30" cy="50" rx="15" ry="10" fill="#FFFFFF" />
      <ellipse cx="70" cy="50" rx="15" ry="10" fill="#FFFFFF" />
      
      {/* Legs */}
      <rect x="45" y="70" width="3" height="15" fill="#FFFFFF" />
      <rect x="52" y="70" width="3" height="15" fill="#FFFFFF" />
    </svg>
  )
}

function BakeryIcon({ color = colors.accent }) {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cupcake base */}
      <rect x="30" y="50" width="40" height="30" rx="5" fill={color} />
      
      {/* Cupcake wrapper */}
      <rect x="25" y="50" width="50" height="35" rx="8" fill="#FFFFFF" />
      
      {/* Frosting */}
      <path d="M25 50 Q35 40 45 50 Q55 40 65 50 Q75 40 85 50" stroke={color} strokeWidth="8" fill="none" />
      
      {/* Cherry on top */}
      <circle cx="50" cy="35" r="4" fill="#DC143C" />
      
      {/* Sprinkles */}
      <rect x="35" y="45" width="2" height="6" fill="#FFD700" />
      <rect x="45" y="45" width="2" height="6" fill="#FFD700" />
      <rect x="55" y="45" width="2" height="6" fill="#FFD700" />
      <rect x="65" y="45" width="2" height="6" fill="#FFD700" />
    </svg>
  )
}

function BeverageIcon({ color = colors.accent }) {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cup */}
      <path d="M30 20 L30 80 L70 80 L70 20 Z" fill="#FFFFFF" />
      
      {/* Liquid */}
      <rect x="32" y="25" width="36" height="50" fill={color} />
      
      {/* Straw */}
      <line x1="60" y1="15" x2="60" y2="40" stroke="#FFD700" strokeWidth="3" />
      
      {/* Ice cubes */}
      <rect x="40" y="30" width="6" height="6" fill="#FFFFFF" />
      <rect x="50" y="35" width="6" height="6" fill="#FFFFFF" />
      <rect x="45" y="45" width="6" height="6" fill="#FFFFFF" />
      
      {/* Cup handle */}
      <path d="M70 40 Q80 40 80 50 Q80 60 70 60" stroke={color} strokeWidth="4" fill="none" />
    </svg>
  )
}

function SeafoodIcon({ color = colors.accent }) {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fish body */}
      <ellipse cx="50" cy="50" rx="25" ry="15" fill={color} />
      
      {/* Fish tail */}
      <path d="M25 50 Q15 40 20 50 Q15 60 25 50" fill={color} />
      
      {/* Fish head */}
      <ellipse cx="65" cy="50" rx="15" ry="12" fill={color} />
      
      {/* Eye */}
      <circle cx="70" cy="45" r="3" fill="#000000" />
      
      {/* Fins */}
      <ellipse cx="40" cy="40" rx="8" ry="4" fill="#FFFFFF" />
      <ellipse cx="40" cy="60" rx="8" ry="4" fill="#FFFFFF" />
      
      {/* Scales */}
      <circle cx="45" cy="45" r="2" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="2" fill="#FFFFFF" />
      <circle cx="45" cy="55" r="2" fill="#FFFFFF" />
    </svg>
  )
}

// Menu Item Component
function MenuItem({ name, price, quantity = 0, onQuantityChange, category }) {
  // Get the correct image based on item name and category
  const getImagePath = (itemName, category) => {
    const name = itemName?.toLowerCase() || '';
    
    // Specific item mappings for accuracy
    if (name.includes('pizza')) return '/pizza.jpg';
    if (name.includes('burger')) return '/burger.jpg';
    if (name.includes('chicken parmesan')) return '/chicken-parmesan.png';
    if (name.includes('grilled chicken')) return '/grill chicken.jpg';
    if (name.includes('coca cola')) return '/cococola.jpg';
    if (name.includes('orange juice')) return '/orange juice.jpg';
    if (name.includes('salmon')) return '/salamon.jpg';
    if (name.includes('chocolate cake')) return '/choclate cake.jpg';
    if (name.includes('apple pie')) return '/apple pie.jpg';
    
    // Fallback to category-based mapping
    switch (category?.toLowerCase()) {
      case 'pizza': return '/pizza.jpg';
      case 'burger': return '/burger.jpg';
      case 'chicken': return '/grill chicken.jpg';
      case 'beverage': return '/cococola.jpg';
      case 'seafood': return '/salamon.jpg';
      case 'bakery': return '/choclate cake.jpg';
      default: return '/chicken-parmesan.png';
    }
  };

  return (
    <div style={{
      background: colors.panel,
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minHeight: 160,
      position: 'relative'
    }}>
      {/* Menu Item Image */}
      <div style={{
        width: '100%',
        height: 80,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8
      }}>
        <img 
          src={getImagePath(name, category)} 
          alt={name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            borderRadius: 6
          }}
        />
      </div>
      
      <div style={{ fontSize: 12, color: colors.muted }}>Order → Kitchen</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: colors.text }}>{name}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>${price}</div>
      
      {/* Pink circle indicator for quantity */}
      {quantity > 0 && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: colors.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#333333'
        }}>
          {quantity}
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 12,
        marginTop: 'auto'
      }}>
        <button 
          onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: colors.accent,
            border: 'none',
            color: '#333333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 18,
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#E8A8C8';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = colors.accent;
            e.target.style.transform = 'scale(1)';
          }}
        >
          −
        </button>
        <span style={{ 
          fontSize: 16, 
          fontWeight: 500, 
          color: colors.text,
          minWidth: 20,
          textAlign: 'center'
        }}>
          {quantity.toString().padStart(2, '0')}
        </span>
        <button 
          onClick={() => {
            const newQuantity = quantity + 1;
            onQuantityChange(newQuantity);
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: colors.accent,
            border: 'none',
            color: '#333333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 18,
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#E8A8C8';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = colors.accent;
            e.target.style.transform = 'scale(1)';
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}


export default function Orders() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'create'
  const [orderItems, setOrderItems] = useState([]);
  const [menuItemQuantities, setMenuItemQuantities] = useState({});
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Load categories from localStorage or use default
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('inventoryCategories');
    if (savedCategories) {
      const inventoryCategories = JSON.parse(savedCategories);
      return [
        { name: 'Chicken', icon: ChickenIcon },
        { name: 'Pizza', icon: PizzaIcon },
        { name: 'Burger', icon: BurgerIcon },
        { name: 'Beverage', icon: BeverageIcon },
        ...inventoryCategories.filter(cat => !['Chicken', 'Pizza', 'Burger', 'Beverage'].includes(cat)).map(category => ({
          name: category,
          icon: PizzaIcon // Default icon for new categories
        }))
      ];
    }
    return [
      { name: 'Chicken', icon: ChickenIcon },
      { name: 'Pizza', icon: PizzaIcon },
      { name: 'Burger', icon: BurgerIcon },
      { name: 'Beverage', icon: BeverageIcon }
    ];
  });
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Listen for changes in localStorage to update categories in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCategories = localStorage.getItem('inventoryCategories');
      if (savedCategories) {
        const inventoryCategories = JSON.parse(savedCategories);
        setCategories([
          { name: 'Chicken', icon: ChickenIcon },
          { name: 'Pizza', icon: PizzaIcon },
          { name: 'Burger', icon: BurgerIcon },
          { name: 'Beverage', icon: BeverageIcon },
          ...inventoryCategories.filter(cat => !['Chicken', 'Pizza', 'Burger', 'Beverage'].includes(cat)).map(category => ({
            name: category,
            icon: PizzaIcon // Default icon for new categories
          }))
        ]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Search Bar Component was moved to module scope
  

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);

  // Refetch function to get fresh data from database
  const refetchOrders = async () => {
    try {
      console.log('🔄 Refetching orders from database...');
      const ordersData = await getOrders();
      setOrders(ordersData);
      console.log('✅ Orders refetched successfully');
    } catch (error) {
      console.error('Error refetching orders:', error);
    }
  };

  // Fetch orders and menu items on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersResponse, menuItemsResponse] = await Promise.all([
          getOrders({ page: 1, limit: 100 }), // Use pagination for faster loading
          getMenuItems({ page: 1, limit: 100 })
        ]);
        
        // Handle both paginated and non-paginated response
        const ordersData = ordersResponse.items || ordersResponse;
        const menuItemsData = menuItemsResponse.items || menuItemsResponse;
        
        setOrders(ordersData);
        setMenuItems(menuItemsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load orders and menu items', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Initialize real-time synchronization
    realtimeSync.initialize();
  }, []);

  // Add real-time listeners for Orders page
  useEffect(() => {
    // Listen for real-time refresh events
    const handleRealtimeRefresh = async () => {
      console.log('🔄 Orders page real-time refresh triggered');
      try {
        const ordersData = await getOrders();
        setOrders(ordersData);
        
        const menuItemsResponse = await getMenuItems({ page: 1, limit: 100 }); // Use pagination
        const menuItemsData = menuItemsResponse.items || menuItemsResponse; // Handle both formats
        setMenuItems(menuItemsData);
      } catch (error) {
        console.error('Error refreshing orders data:', error);
      }
    };
    
    // Listen for menu items updates
    const handleMenuItemsUpdate = (event) => {
      const { type, data } = event.detail;
      if (type === 'menuItems') {
        setMenuItems(data);
      }
    };
    
    window.addEventListener('realtime-refresh', handleRealtimeRefresh);
    window.addEventListener('cosypos-data-update', handleMenuItemsUpdate);
    
    return () => {
      window.removeEventListener('realtime-refresh', handleRealtimeRefresh);
      window.removeEventListener('cosypos-data-update', handleMenuItemsUpdate);
    };
  }, []);

  const defaultCategories = [
    { name: 'Pizza', itemCount: 20, icon: PizzaIcon },
    { name: 'Burger', itemCount: 15, icon: BurgerIcon },
    { name: 'Chicken', itemCount: 10, icon: ChickenIcon },
    { name: 'Bakery', itemCount: 18, icon: BakeryIcon },
    { name: 'Beverage', itemCount: 12, icon: BeverageIcon },
    { name: 'Seafood', itemCount: 16, icon: SeafoodIcon }
  ];

  // Transform menu items from backend to frontend format
  const transformedMenuItems = menuItems.map(item => ({
    name: item.name,
    price: item.priceCents / 100, // Convert from cents to dollars
    id: item.id,
    menuItemId: item.id,
    category: item.category?.name || 'Other'
  }));

  // Filter menu items by selected category
  const filteredMenuItems = selectedCategory === 'All' 
    ? transformedMenuItems 
    : transformedMenuItems.filter(item => item.category === selectedCategory);

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleQuantityChange = (itemId, newQuantity) => {
    setOrderItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleAddToOrder = (name, price, quantity) => {
    const existingItem = orderItems.find(item => item.name === name);
    if (existingItem) {
      // Only add 1 to the existing quantity, not the full quantity
      handleQuantityChange(existingItem.id, existingItem.quantity + 1);
    } else {
      setOrderItems(prev => [...prev, {
        id: Date.now(),
        name: name,
        price: price,
        quantity: 1 // Always start with quantity 1 for new items
      }]);
    }
  };

  const handleMenuItemQuantityChange = (itemName, newQuantity) => {
    setMenuItemQuantities(prev => ({
      ...prev,
      [itemName]: newQuantity
    }));
    
    // Find the item in the menu to get its price and ID
    const menuItem = transformedMenuItems.find(item => item.name === itemName);
    if (menuItem) {
      // If quantity is 0, remove from cart
      if (newQuantity === 0) {
        setOrderItems(prev => prev.filter(item => item.name !== itemName));
      } else {
        // Update or add to cart
        const existingItem = orderItems.find(item => item.name === itemName);
        if (existingItem) {
          // Update existing item quantity
          setOrderItems(prev => prev.map(item => 
            item.name === itemName ? { ...item, quantity: newQuantity } : item
          ));
        } else {
          // Add new item to cart
          setOrderItems(prev => [...prev, {
            id: Date.now(),
            name: itemName,
            price: menuItem.price,
            quantity: newQuantity,
            menuItemId: menuItem.menuItemId
          }]);
        }
      }
    }
  };

  const handleDeleteFromOrder = (itemId) => {
    setOrderItems(items => items.filter(item => item.id !== itemId));
  };

  const handleAddNewOrder = () => {
    setCurrentView('create');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleSendToKitchen = async () => {
    // Validate that there are items in the order
    if (orderItems.length === 0) {
      showToast('Please add items to your order before sending to kitchen.', 'error');
      return;
    }

    try {
      if (editingOrder) {
        // Update existing order
        const orderData = {
          items: orderItems.map(item => ({
            menuItemId: item.menuItemId || item.id,
            quantity: item.quantity,
            price: item.price
          })),
          status: 'IN_PROGRESS',
          userId: user?.id
        };
        
        const updatedOrder = await updateOrder(editingOrder.id, orderData);
        setOrders(prev => prev.map(order => 
          order.id === editingOrder.id ? updatedOrder : order
        ));
        setEditingOrder(null);
        showToast(`Order #${updatedOrder.orderNumber} has been updated!`, 'success');
        
        // Refetch to ensure data is in sync with database
        await refetchOrders();
      } else {
        // Create new order
        const orderData = {
          items: orderItems.map(item => ({
            menuItemId: item.menuItemId || item.id,
            quantity: item.quantity,
            price: item.price
          })),
          userId: user?.id,
          tableId: null // You can add table selection later
        };
        
        const newOrder = await createOrder(orderData);
        setOrders(prev => [newOrder, ...prev]);
        showToast(`Order #${newOrder.orderNumber} has been created and sent to kitchen!`, 'success');
        
        // Refetch to ensure data is in sync with database
        await refetchOrders();
      }
      
      setOrderItems([]);
      setMenuItemQuantities({});
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error saving order:', error);
      showToast('Failed to save order. Please try again.', 'error');
    }
  };

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


  // Filter orders based on active filter and search term
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Map database status to display status
      const getDisplayStatus = (status) => {
        switch (status) {
          case 'PENDING': return 'Pending';
          case 'IN_PROGRESS': return 'In Process';
          case 'SERVED': return 'Ready';
          case 'PAID': return 'Completed';
          case 'CANCELLED': return 'Cancelled';
          default: return status;
        }
      };

      const displayStatus = getDisplayStatus(order.status);
      const matchesFilter = activeFilter === 'All' || displayStatus === activeFilter;
      
      // If no search term, show all orders that match the filter
      if (!debouncedSearchTerm.trim()) {
        return matchesFilter;
      }
      
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchLower) ||
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.name.toLowerCase().includes(searchLower));
      
      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, debouncedSearchTerm]);


  // Search handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);


  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const updatedOrder = await updateOrder(orderId, {
        status: newStatus
      });
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      showToast(`Order status updated to ${newStatus}`, 'success');
      
      // Refetch to ensure data is in sync with database
      await refetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Failed to update order status. Please try again.', 'error');
    }
  };

  // Payment handlers - Only for customers (USER role)
  const handlePayBill = (order) => {
    setSelectedOrderForPayment(order);
    setShowPaymentPage(true);
  };

  const handleClosePaymentPage = () => {
    setShowPaymentPage(false);
    setSelectedOrderForPayment(null);
  };

  const handlePaymentComplete = async () => {
    if (selectedOrderForPayment) {
      try {
        const updatedOrder = await updateOrder(selectedOrderForPayment.id, {
          status: 'PAID'
        });
        setOrders(prev => prev.map(order => 
          order.id === selectedOrderForPayment.id ? updatedOrder : order
        ));
        showToast('Payment successful! Order completed.', 'success');
        
        // Refetch to ensure data is in sync with database
        await refetchOrders();
      } catch (error) {
        console.error('Error processing payment:', error);
        showToast('Failed to process payment. Please try again.', 'error');
      }
    }
    handleClosePaymentPage();
  };

  // Order details handlers
  const handleViewOrderDetails = (order) => {
    setSelectedOrderForDetails(order);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrderForDetails(null);
  };

  // Dashboard View Component
  const DashboardView = () => (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideInRight {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
      <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative' }}>
        <Sidebar />
        <HeaderBar title="Orders" showBackButton={true} onBackClick={() => window.history.back()} right={(
          <>
            {/* Add New Order Button - Only for customers */}
            {user?.role === 'USER' && (
              <button 
                onClick={handleAddNewOrder}
                style={{
                  background: colors.accent,
                  color: '#333333',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  marginRight: 16
                }}
                onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
                onMouseLeave={(e) => e.target.style.background = colors.accent}
              >
                Add Order
              </button>
            )}

            {/* Search Bar - Only for ADMIN and USER roles */}
            {(user?.role === 'ADMIN' || user?.role === 'USER') && (
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                isSearching={isSearching}
                onClear={handleClearSearch}
              />
            )}

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
              <Bell size={20} color="#FFFFFF" />
              
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
                position: 'relative',
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
        
        <main style={{ 
          paddingLeft: 208, 
          paddingRight: 32, 
          paddingTop: 20, 
          paddingBottom: 32
        }}>
          {/* Filter Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: 0, 
            marginBottom: 24,
            borderBottom: `1px solid ${colors.muted}`
          }}>
            {['All', 'Pending', 'In Process', 'Ready', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                style={{
                  background: activeFilter === tab ? colors.accent : 'transparent',
                  color: activeFilter === tab ? '#333333' : colors.muted,
                  border: 'none',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: activeFilter === tab ? 500 : 400,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== tab) {
                    e.target.style.color = colors.text;
                    e.target.style.background = '#3D4142';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== tab) {
                    e.target.style.color = colors.muted;
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Order Cards Grid */}
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: colors.muted,
              fontSize: 16
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <div>Loading orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: colors.muted,
              fontSize: 16
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div>No orders found</div>
              <div style={{ fontSize: 14, marginTop: 8 }}>
                {searchTerm ? `No results for "${searchTerm}"` : 'Try adjusting your filters'}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24
            }}>
              {filteredOrders.map((order, index) => (
              <div key={order.id} style={{
                background: order.customerId === user?.id ? 'rgba(250, 193, 217, 0.05)' : colors.panel,
                borderRadius: 12,
                padding: 20,
                position: 'relative',
                border: order.customerId === user?.id ? `2px solid ${colors.accent}` : 'none',
                boxShadow: order.customerId === user?.id ? `0 4px 12px rgba(250, 193, 217, 0.2)` : 'none',
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Order Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: 16,
                  minHeight: 60
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: 24, 
                      fontWeight: 600, 
                      color: colors.text,
                      marginBottom: 4
                    }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 500, 
                      color: colors.text,
                      marginBottom: 2,
                      wordBreak: 'break-word'
                    }}>
                      {order.customerName}
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: colors.muted,
                      marginBottom: 4
                    }}>
                      Order # {order.orderNumber}
                    </div>
                    {order.customerId === user?.id && (
                      <div style={{ 
                        fontSize: 11, 
                        color: colors.accent,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: 'rgba(250, 193, 217, 0.1)',
                        padding: '3px 6px',
                        borderRadius: 3,
                        border: `1px solid ${colors.accent}`,
                        display: 'inline-block',
                        marginTop: 4
                      }}>
                        ✨ Your Order
                      </div>
                    )}
                  </div>
                  
                  {/* Status Badge - Consistent positioning */}
                  <div style={{
                    background: order.statusColor,
                    color: order.status === 'SERVED' || order.status === 'PAID' ? '#FFFFFF' : '#333333',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    minWidth: 90,
                    maxWidth: 100,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    flexShrink: 0
                  }}>
                    {order.status === 'SERVED' || order.status === 'PAID' ? '✓' : '✔'} {order.statusDot}
                  </div>
                </div>

                {/* Date and Time */}
                <div style={{ 
                  fontSize: 12, 
                  color: colors.muted,
                  marginBottom: 16
                }}>
                  {order.date} • {order.time}
                </div>

                {/* Order Items */}
                <div style={{ marginBottom: 16, flex: 1 }}>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr 1fr',
                    gap: 8,
                    marginBottom: 8,
                    fontSize: 12,
                    color: colors.muted,
                    fontWeight: 500
                  }}>
                    <div>Qty</div>
                    <div>Items</div>
                    <div>Price</div>
                  </div>
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr 1fr',
                      gap: 8,
                      fontSize: 14,
                      color: colors.text,
                      marginBottom: 4
                    }}>
                      <div>{item.quantity}</div>
                      <div>{item.name}</div>
                      <div>${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div style={{ 
                  fontSize: 16, 
                  fontWeight: 600, 
                  color: colors.text,
                  marginBottom: 16,
                  textAlign: 'right'
                }}>
                  ${order.subtotal.toFixed(2)}
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 'auto',
                  paddingTop: 16,
                  borderTop: `1px solid ${colors.muted}20`
                }}>
                  {/* Status Update - Only for ADMIN and STAFF users */}
                  {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                    <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        style={{
                          background: colors.bg,
                          border: `1px solid ${colors.muted}`,
                          borderRadius: 6,
                          color: colors.text,
                          padding: '8px 12px',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          outline: 'none',
                          minWidth: 120,
                          flex: 1,
                          transition: 'border-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.borderColor = colors.accent}
                        onMouseLeave={(e) => e.target.style.borderColor = colors.muted}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Process</option>
                        <option value="SERVED">Ready</option>
                        <option value="PAID">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  )}

                  {/* Pay Now Button - Only for orders created by the current user */}
                  {user?.role === 'USER' && order.customerId === user?.id && (order.status === 'SERVED' || order.status === 'PENDING') && (
                    <button 
                      onClick={() => handlePayBill(order)}
                      style={{
                        background: colors.accent,
                        color: '#333333',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: 90,
                        flexShrink: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#E8A8C8';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = colors.accent;
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      💳 Pay Now
                    </button>
                  )}

                  {/* View Details Button - For customers to see order details */}
                  {user?.role === 'USER' && order.customerId === user?.id && order.status !== 'SERVED' && order.status !== 'PENDING' && (
                    <button 
                      onClick={() => handleViewOrderDetails(order)}
                      style={{
                        background: 'transparent',
                        color: colors.text,
                        border: `1px solid ${colors.muted}`,
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: 90,
                        flexShrink: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = colors.muted;
                        e.target.style.borderColor = colors.accent;
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.borderColor = colors.muted;
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      👁️ View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );

  // Create Order View Component
  const CreateOrderView = () => (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
      <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative' }}>
        <Sidebar />
        <HeaderBar title="Add Order Page" showBackButton={true} onBackClick={handleBackToDashboard} right={(
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
                position: 'relative',
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
        
        <main style={{ 
          paddingLeft: 208, 
          paddingRight: 32, 
          paddingTop: 20, 
          paddingBottom: 32,
          display: 'flex',
          gap: 24
        }}>
          {/* Left Content Area - Categories and Menu Items */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Categories Grid */}
            <Categories
              categories={[
                { id: 'All', name: 'All', count: transformedMenuItems.length, icon: PizzaIcon },
                ...defaultCategories.map((category, index) => ({
                  id: category.name,
                  name: category.name,
                  count: transformedMenuItems.filter(item => item.category === category.name).length,
                  icon: category.icon
                }))
              ]}
              activeCategory={selectedCategory}
              onCategoryClick={setSelectedCategory}
              user={user}
              layout="grid"
              showAddButton={false}
            />

            {/* Separator Line */}
            <div style={{
              height: 2,
              background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
              margin: '24px 0',
              borderRadius: 1
            }} />

            {/* Menu Items Grid */}
            <div className="grid-4-cols" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12
            }}>
              {filteredMenuItems.map((item, index) => (
                <MenuItem 
                  key={index}
                  name={item.name}
                  price={item.price.toFixed(2)}
                  quantity={menuItemQuantities[item.name] || 0}
                  category={item.category}
                  onQuantityChange={(newQuantity) => {
                    handleMenuItemQuantityChange(item.name, newQuantity);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar - Order Summary */}
          <div style={{ 
            width: 320,
            background: colors.panel,
            borderRadius: 10,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 24
          }}>
            {/* Table Info */}
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                Table 01
              </div>
              <div style={{ 
                fontSize: 16, 
                color: colors.text, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8 
              }}>
                {user?.name || 'Customer'}
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  fontSize: 16
                }}>
                  ✏️
                </button>
              </div>
            </div>

            {/* Ordered Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orderItems.map((item, index) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: colors.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#333333'
                    }}>
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <span style={{ fontSize: 14, color: colors.text }}>
                      {item.name} x {item.quantity}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button 
                      onClick={() => handleDeleteFromOrder(item.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: colors.accent,
                        border: 'none',
                        color: '#333333',
                        cursor: 'pointer',
                        fontSize: 16,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#E8A8C8';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = colors.accent;
                        e.target.style.transform = 'scale(1)';
                      }}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: 14,
                color: colors.text
              }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: 14,
                color: colors.text
              }}>
                <span>Tax 5%</span>
                <span>${tax.toFixed(1)}</span>
              </div>
              <div style={{ 
                height: 1, 
                background: colors.muted, 
                margin: '8px 0' 
              }} />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: 16,
                fontWeight: 600,
                color: colors.text
              }}>
                <span>Total</span>
                <span>${total.toFixed(1)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 500, 
                color: colors.text, 
                marginBottom: 12 
              }}>
                Payment Method
              </div>
              <div style={{
                background: colors.bg,
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}>
                {/* QR Code Image */}
                <img 
                  src="/QR.png" 
                  alt="QR Code"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 4,
                    objectFit: 'cover'
                  }}
                />
                <div style={{ fontSize: 12, color: colors.text }}>
                  Scan QR Code
                </div>
              </div>
            </div>

            {/* Send to Kitchen Button */}
            <button 
              onClick={handleSendToKitchen}
              style={{
                width: '100%',
                padding: '16px',
                background: colors.accent,
                color: '#333333',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
              onMouseLeave={(e) => e.target.style.background = colors.accent}
            >
              Send To Kitchen
            </button>
          </div>
        </main>
      </div>
    </div>
  );

  // Order Details Modal Component
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    const getStatusColor = (status) => {
      switch (status) {
        case 'PENDING': return '#FFA500';
        case 'IN_PROGRESS': return '#2196F3';
        case 'SERVED': return '#4CAF50';
        case 'PAID': return '#8BC34A';
        case 'CANCELLED': return '#F44336';
        default: return colors.muted;
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'PENDING': return 'Pending';
        case 'IN_PROGRESS': return 'In Process';
        case 'SERVED': return 'Ready';
        case 'PAID': return 'Completed';
        case 'CANCELLED': return 'Cancelled';
        default: return status;
      }
    };

    // Handle backdrop click to close modal
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

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
          zIndex: 10000,
          padding: 20,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={handleBackdropClick}
      >
        <div 
          style={{
            background: colors.panel,
            borderRadius: 16,
            padding: 0,
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '24px 24px 16px 24px',
            borderBottom: `1px solid ${colors.muted}20`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: 24,
                fontWeight: 600,
                color: colors.text,
                margin: 0,
                marginBottom: 4
              }}>
                Order Details
              </h2>
              <p style={{
                fontSize: 14,
                color: colors.muted,
                margin: 0
              }}>
                Order #{order.orderNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.muted,
                fontSize: 24,
                cursor: 'pointer',
                padding: 8,
                borderRadius: 8,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = colors.text;
                e.target.style.background = colors.muted + '20';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = colors.muted;
                e.target.style.background = 'transparent';
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px'
          }}>
            {/* Order Info */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 16
              }}>
                <div>
                  <label style={{
                    fontSize: 12,
                    color: colors.muted,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 4,
                    display: 'block'
                  }}>
                    Customer
                  </label>
                  <div style={{
                    fontSize: 16,
                    color: colors.text,
                    fontWeight: 500
                  }}>
                    {order.customerName}
                  </div>
                </div>
                <div>
                  <label style={{
                    fontSize: 12,
                    color: colors.muted,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 4,
                    display: 'block'
                  }}>
                    Status
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: getStatusColor(order.status)
                    }} />
                    <span style={{
                      fontSize: 16,
                      color: colors.text,
                      fontWeight: 500
                    }}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{
                    fontSize: 12,
                    color: colors.muted,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 4,
                    display: 'block'
                  }}>
                    Date & Time
                  </label>
                  <div style={{
                    fontSize: 16,
                    color: colors.text,
                    fontWeight: 500
                  }}>
                    {order.date} • {order.time}
                  </div>
                </div>
                <div>
                  <label style={{
                    fontSize: 12,
                    color: colors.muted,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 4,
                    display: 'block'
                  }}>
                    Total Amount
                  </label>
                  <div style={{
                    fontSize: 18,
                    color: colors.text,
                    fontWeight: 600
                  }}>
                    ${order.subtotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 16
              }}>
                Order Items
              </h3>
              <div style={{
                background: colors.bg,
                borderRadius: 8,
                padding: 16,
                border: `1px solid ${colors.muted}20`
              }}>
                {order.items.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < order.items.length - 1 ? `1px solid ${colors.muted}20` : 'none'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: colors.text,
                        marginBottom: 2
                      }}>
                        {item.name}
                      </div>
                      <div style={{
                        fontSize: 14,
                        color: colors.muted
                      }}>
                        Quantity: {item.quantity}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: colors.text,
                      textAlign: 'right'
                    }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div style={{
              background: colors.bg,
              borderRadius: 8,
              padding: 16,
              border: `1px solid ${colors.muted}20`
            }}>
              <h4 style={{
                fontSize: 16,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 12
              }}>
                Order Summary
              </h4>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: `1px solid ${colors.muted}20`
              }}>
                <span style={{ color: colors.muted }}>Subtotal</span>
                <span style={{ color: colors.text, fontWeight: 500 }}>
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: `1px solid ${colors.muted}20`
              }}>
                <span style={{ color: colors.muted }}>Tax (5%)</span>
                <span style={{ color: colors.text, fontWeight: 500 }}>
                  ${(order.subtotal * 0.05).toFixed(2)}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0 0 0',
                fontSize: 18,
                fontWeight: 600,
                color: colors.text
              }}>
                <span>Total</span>
                <span>${(order.subtotal * 1.05).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: `1px solid ${colors.muted}20`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: `1px solid ${colors.muted}`,
                borderRadius: 8,
                color: colors.text,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = colors.muted;
                e.target.style.borderColor = colors.accent;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = colors.muted;
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main return with conditional rendering
  if (showPaymentPage) {
    return (
      <Payment 
        order={selectedOrderForPayment}
        onPaymentComplete={handlePaymentComplete}
        onCancel={handleClosePaymentPage}
      />
    );
  }

  if (showOrderDetails) {
    return (
      <OrderDetailsModal 
        order={selectedOrderForDetails}
        onClose={handleCloseOrderDetails}
      />
    );
  }

  return (
    <>
      {currentView === 'dashboard' ? DashboardView() : CreateOrderView()}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </>
  );
}


