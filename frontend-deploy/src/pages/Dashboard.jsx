import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { getMenuItems } from '../utils/api';
import Layout from './Layout.jsx';
import { onInventoryUpdate } from '../utils/inventorySync';
import dataSync from '../utils/dataSync';
import realtimeSync from '../utils/realtimeSync';

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  accent: '#FAC1D9',
  text: '#FFFFFF',
  muted: '#777979',
  line: '#3D4142',
};

function DollarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 1V17M13 5H6.5C5.11929 5 4 6.11929 4 7.5C4 8.88071 5.11929 10 6.5 10H11.5C12.8807 10 14 11.1193 14 12.5C14 13.8807 12.8807 15 11.5 15H4" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function StatCard({ title, value, rightIcon, date, isDailySales = false, chartPattern = 'daily' }) {
  return (
    <div className="stat-card" style={{ 
      position: 'relative', 
      background: colors.panel, 
      borderRadius: 10, 
      minHeight: 140,
      width: '100%',
      color: colors.text,
      padding: 16
    }}>
      <style>{`
        @media (min-width: 768px) {
          .stat-card {
            min-height: 150px !important;
            padding: 18px !important;
          }
        }
        @media (min-width: 1024px) {
          .stat-card {
            min-height: 166px !important;
            padding: 20px !important;
          }
        }
      `}</style>
      {/* Title */}
      <div style={{ 
        position: 'absolute', 
        left: 15.98, 
        top: 18.57, 
        fontFamily: 'Poppins', 
        fontWeight: 300, 
        fontSize: 16, 
        lineHeight: '24px', 
        color: '#FFFFFF' 
      }}>
        {title}
      </div>
      
      {/* Date (for Daily Sales) */}
      {isDailySales && (
        <div style={{ 
          position: 'absolute', 
          left: 15.98, 
          bottom: 10.02, 
          fontFamily: 'Poppins', 
          fontWeight: 300, 
          fontSize: 16, 
          lineHeight: '24px', 
          color: '#777979' 
        }}>
          {date}
        </div>
      )}
      
      {/* Value */}
      <div style={{ 
        position: 'absolute', 
        left: 15.98, 
        top: 49.57, 
        fontFamily: 'Poppins', 
        fontWeight: 500, 
        fontSize: 25, 
        lineHeight: '38px', 
        color: '#FFFFFF' 
      }}>
        {value}
      </div>
      
      {/* Right icon circle */}
      <div style={{ 
        position: 'absolute', 
        right: 15.57, 
        top: 18.57, 
        width: 35.66, 
        height: 35.66, 
        borderRadius: '50%', 
        background: colors.accent, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        {rightIcon || <DollarIcon />}
      </div>
      
      {/* Chart bars */}
      <div style={{ 
        position: 'absolute', 
        right: 15.25, 
        bottom: 0.02, 
        width: 154, 
        height: 90.64 
      }}>
        {(() => {
          const patterns = {
            daily: [
              { left: '0%', right: '95.89%', height: '45%' },
              { left: '13.7%', right: '82.19%', height: '75%' },
              { left: '27.4%', right: '68.49%', height: '60%' },
              { left: '41.1%', right: '54.79%', height: '35%' },
              { left: '54.79%', right: '41.1%', height: '85%' },
              { left: '68.49%', right: '27.4%', height: '50%' },
              { left: '82.19%', right: '13.7%', height: '25%' },
              { left: '95.83%', right: '0%', height: '40%' }
            ],
            monthly: [
              { left: '0%', right: '95.89%', height: '80%' },
              { left: '13.7%', right: '82.19%', height: '65%' },
              { left: '27.4%', right: '68.49%', height: '90%' },
              { left: '41.1%', right: '54.79%', height: '70%' },
              { left: '54.79%', right: '41.1%', height: '55%' },
              { left: '68.49%', right: '27.4%', height: '85%' },
              { left: '82.19%', right: '13.7%', height: '75%' },
              { left: '95.83%', right: '0%', height: '60%' }
            ],
            tables: [
              { left: '0%', right: '95.89%', height: '30%' },
              { left: '13.7%', right: '82.19%', height: '50%' },
              { left: '27.4%', right: '68.49%', height: '40%' },
              { left: '41.1%', right: '54.79%', height: '70%' },
              { left: '54.79%', right: '41.1%', height: '35%' },
              { left: '68.49%', right: '27.4%', height: '45%' },
              { left: '82.19%', right: '13.7%', height: '60%' },
              { left: '95.83%', right: '0%', height: '25%' }
            ]
          };
          
          return patterns[chartPattern] || patterns.daily;
        })().map((bar, i) => (
          <div key={i} style={{ 
            position: 'absolute', 
            left: bar.left, 
            right: bar.right, 
            bottom: 0,
            height: bar.height,
            background: '#50CD89', 
            borderRadius: 2.97167 
          }} />
        ))}
      </div>
    </div>
  );
}


function DishItem({ dish, getImagePath }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{ 
        position: 'relative', 
        background: isHovered ? '#4A4E4F' : '#3D4142', 
        borderRadius: 8, 
        height: 77, 
        padding: 12, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: isHovered ? `1px solid ${colors.accent}` : '1px solid transparent',
        boxShadow: isHovered ? '0 4px 12px rgba(250, 193, 217, 0.2)' : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={getImagePath(dish.name, dish.category)} alt={dish.name} style={{ width: 89, height: 67, objectFit: 'contain', borderRadius: 5 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, color: '#FFFFFF' }}>{dish.name}</div>
        <div style={{ fontSize: 14, color: colors.muted }}>{dish.serving}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ 
          fontSize: 14, 
          color: isHovered ? colors.accent : '#FFFFFF',
          transition: 'color 0.2s ease'
        }}>
          {dish.price}
        </div>
        <div style={{ 
          fontSize: 16, 
          color: dish.status === 'Out of stock' ? '#F60000' : (isHovered ? colors.accent : '#FFFFFF'),
          transition: 'color 0.2s ease'
        }}>
          {dish.status}
        </div>
      </div>
    </div>
  );
}

function ListCard({ title, dishes = [], getImagePath }) {
  // Use the dishes prop passed from parent component

  return (
    <div style={{ 
      position: 'relative', 
      background: colors.panel, 
      borderRadius: 10, 
      height: 'auto',
      minHeight: 300,
      padding: 16, 
      color: colors.text,
      width: '100%'
    }}>
      <style>{`
        @media (min-width: 768px) {
          .list-card {
            min-height: 400px;
            padding: 20px !important;
          }
        }
        @media (min-width: 1024px) {
          .list-card {
            min-height: 466px;
            padding: 24px !important;
          }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 25, fontWeight: 500 }}>{title}</div>
        <a href="#" style={{ color: colors.accent, textDecoration: 'underline' }}>See All</a>
      </div>
      <div style={{ 
        marginTop: 16, 
        maxHeight: 350, 
        overflowY: 'auto',
        paddingRight: 8
      }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {dishes.map((dish, i) => (
            <DishItem key={i} dish={dish} getImagePath={getImagePath} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [menuItems, setMenuItems] = useState([]);

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await getMenuItems({ page: 1, limit: 50 }); // Use pagination for faster loading
        
        // Handle both paginated and non-paginated response
        const items = response.items || response;
        
        // Transform to Dashboard format
        const transformedItems = items.map(item => ({
          name: item.name,
          price: `$${(item.priceCents / 100).toFixed(2)}`,
          status: item.availability,
          serving: 'Serving : 01 person',
          category: item.category?.name || 'Other'
        }));
        setMenuItems(transformedItems);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        // Fallback to empty array
        setMenuItems([]);
      }
    };
    
    fetchMenuItems();
  }, []);

  // Helper function to get image path for variety checking
  const getImagePath = (itemName, category) => {
    const name = itemName?.toLowerCase() || '';
    
    if (name.includes('margherita') || name.includes('pepperoni')) return '/pizza.jpg';
    if (name.includes('burger')) return '/burger.jpg';
    if (name.includes('chicken parmesan')) return '/chicken-parmesan.png';
    if (name.includes('grilled chicken')) return '/grill chicken.jpg';
    if (name.includes('coca cola') || name.includes('cola')) return '/cococola.jpg';
    if (name.includes('orange juice')) return '/orange juice.jpg';
    if (name.includes('salmon')) return '/salamon.jpg';
    if (name.includes('chocolate cake')) return '/choclate cake.jpg';
    if (name.includes('apple pie')) return '/apple pie.jpg';
    
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

  // Create different data for Popular Dishes and Recent Orders with variety
  const getVariedDishes = (categories, maxItems = 5) => {
    const filteredItems = menuItems.filter(item => 
      item.status === 'In Stock' && categories.includes(item.category)
    );
    
    // Group by image to ensure variety
    const imageGroups = {};
    filteredItems.forEach(item => {
      const imagePath = getImagePath(item.name, item.category);
      if (!imageGroups[imagePath]) {
        imageGroups[imagePath] = [];
      }
      imageGroups[imagePath].push(item);
    });
    
    // Select items ensuring variety (max 2 items per image)
    const variedItems = [];
    const imageKeys = Object.keys(imageGroups);
    
    // First pass: take one item from each image group
    imageKeys.forEach(imageKey => {
      if (variedItems.length < maxItems && imageGroups[imageKey].length > 0) {
        variedItems.push(imageGroups[imageKey].shift());
      }
    });
    
    // Second pass: fill remaining slots with variety
    imageKeys.forEach(imageKey => {
      if (variedItems.length < maxItems && imageGroups[imageKey].length > 0) {
        variedItems.push(imageGroups[imageKey].shift());
      }
    });
    
    return variedItems.slice(0, maxItems);
  };

  const popularDishes = getVariedDishes(['Pizza', 'Burger', 'Chicken'], 5);
  const recentOrders = getVariedDishes(['Beverage', 'Seafood', 'Bakery'], 5);

  // Listen for inventory updates from other components
  useEffect(() => {
    const cleanup = onInventoryUpdate((updatedItem, allItems) => {
      // Update the menu items with the updated inventory item
      setMenuItems(prev => prev.map(item => {
        // Find matching item by name
        if (item.name === updatedItem.name) {
          return {
            ...item,
            status: updatedItem.availability
          };
        }
        return item;
      }));
    });
    
    return cleanup;
  }, []);

  // Listen for real-time data updates from other components
  useEffect(() => {
    // Subscribe to menu items updates
    const unsubscribeMenuItems = dataSync.subscribe('menuItems', (updatedItems) => {
      // Transform to Dashboard format
      const transformedItems = updatedItems.map(item => ({
        name: item.name,
        price: item.price || `$${(item.priceCents / 100).toFixed(2)}`,
        status: item.availability,
        serving: 'Serving : 01 person',
        category: item.category?.name || item.category || 'Other'
      }));
      setMenuItems(transformedItems);
    });
    
    // Listen for global data updates
    const handleGlobalUpdate = (event) => {
      const { type, data } = event.detail;
      if (type === 'menuItems') {
        // Transform to Dashboard format
        const transformedItems = data.map(item => ({
          name: item.name,
          price: item.price || `$${(item.priceCents / 100).toFixed(2)}`,
          status: item.availability,
          serving: 'Serving : 01 person',
          category: item.category?.name || item.category || 'Other'
        }));
        setMenuItems(transformedItems);
      }
    };
    
    // Listen for real-time refresh events
    const handleRealtimeRefresh = async () => {
      console.log('🔄 Dashboard real-time refresh triggered');
      try {
        const items = await getMenuItems();
        const transformedItems = items.map(item => ({
          name: item.name,
          price: `$${(item.priceCents / 100).toFixed(2)}`,
          status: item.availability,
          serving: 'Serving : 01 person',
          category: item.category?.name || 'Other'
        }));
        setMenuItems(transformedItems);
      } catch (error) {
        console.error('Error refreshing dashboard data:', error);
      }
    };
    
    window.addEventListener('cosypos-data-update', handleGlobalUpdate);
    window.addEventListener('realtime-refresh', handleRealtimeRefresh);
    
    return () => {
      unsubscribeMenuItems();
      window.removeEventListener('cosypos-data-update', handleGlobalUpdate);
      window.removeEventListener('realtime-refresh', handleRealtimeRefresh);
    };
  }, []);

  // Removed aggressive visibility change handler to prevent duplicate loading

  return (
    <Layout 
      title="Dashboard" 
      showBackButton={true} 
        right={(
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
        )}>
          {/* Stat row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr',
            gap: 16
          }}>
            <style>{`
              @media (min-width: 768px) {
                .stats-grid {
                  grid-template-columns: repeat(2, 1fr) !important;
                  gap: 20px !important;
                }
              }
              @media (min-width: 1024px) {
                .stats-grid {
                  grid-template-columns: repeat(3, 1fr) !important;
                  gap: 24px !important;
                }
              }
            `}</style>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <StatCard title="Daily Sales" value="$2k" date="9 Feburary 2024" isDailySales={true} chartPattern="daily" />
              <StatCard title="Monthly Revenue" value="$55k" date="1 Jan - 1 Feb" isDailySales={true} chartPattern="monthly" />
              <StatCard title="Table Occupacy" value="25 Tables" date="Current Status" isDailySales={true} chartPattern="tables" />
            </div>
          </div>

          {/* Lists */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr',
            gap: 16, 
            marginTop: 16
          }}>
            <style>{`
              @media (min-width: 768px) {
                .lists-grid {
                  gap: 20px !important;
                  margin-top: 20px !important;
                }
              }
              @media (min-width: 1024px) {
                .lists-grid {
                  grid-template-columns: repeat(2, 1fr) !important;
                  gap: 24px !important;
                  margin-top: 24px !important;
                }
              }
            `}</style>
            <div className="lists-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <ListCard title="Popular Dishes" dishes={popularDishes} getImagePath={getImagePath} />
              <ListCard title="Recent Orders" dishes={recentOrders} getImagePath={getImagePath} />
            </div>
          </div>

          {/* Overview Chart */}
          <div className="chart-container" style={{ 
            marginTop: 16, 
            background: colors.panel, 
            borderRadius: 10, 
            height: 'auto',
            minHeight: 400,
            position: 'relative',
            width: '100%',
            padding: 16,
            overflowX: 'auto'
          }}>
            <style>{`
              @media (min-width: 768px) {
                .chart-container {
                  margin-top: 20px !important;
                  min-height: 450px !important;
                  padding: 20px !important;
                }
              }
              @media (min-width: 1024px) {
                .chart-container {
                  margin-top: 24px !important;
                  min-height: 514px !important;
                  padding: 24px !important;
                  overflow-x: visible !important;
                }
              }
            `}</style>
            {/* Title */}
            <div style={{ 
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: 'clamp(18px, 4vw, 25px)',
              lineHeight: '1.4',
              color: '#FFFFFF',
              marginBottom: 16
            }}>
              Overview
            </div>

            {/* All Buttons Container */}
            <div style={{ 
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: 16
            }}>
              <style>{`
                @media (min-width: 768px) {
                  .buttons-container {
                    gap: 16px !important;
                  }
                }
                @media (min-width: 1024px) {
                  .buttons-container {
                    gap: 25px !important;
                    position: absolute;
                    right: 30px;
                    top: 26px;
                    flex-wrap: nowrap !important;
                  }
                }
              `}</style>
              <div className="buttons-container" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Time Period Selector */}
              <div style={{ 
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <style>{`
                  @media (min-width: 768px) {
                    .period-selector {
                      gap: 16px !important;
                    }
                  }
                  @media (min-width: 1024px) {
                    .period-selector {
                      gap: 25px !important;
                      flex-wrap: nowrap !important;
                    }
                  }
                `}</style>
                <div className="period-selector" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div 
                    onClick={() => setSelectedPeriod('Monthly')}
                    style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '10px 16px',
                      minWidth: 80,
                      height: 'auto',
                      minHeight: 44,
                    background: selectedPeriod === 'Monthly' ? colors.accent : 'transparent',
                      borderRadius: 8,
                      fontFamily: 'Poppins',
                      fontWeight: selectedPeriod === 'Monthly' ? 500 : 400,
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      lineHeight: '1.5',
                      textAlign: 'center',
                      color: selectedPeriod === 'Monthly' ? '#333333' : '#FFFFFF',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      border: selectedPeriod === 'Monthly' ? 'none' : '1px solid #444'
                    }}
                  >
                    Monthly
                  </div>
                  <div 
                    onClick={() => setSelectedPeriod('Daily')}
                    style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '10px 16px',
                      minWidth: 80,
                      height: 'auto',
                      minHeight: 44,
                      background: selectedPeriod === 'Daily' ? colors.accent : 'transparent',
                      borderRadius: 8,
                      fontFamily: 'Poppins',
                      fontWeight: selectedPeriod === 'Daily' ? 500 : 400,
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      lineHeight: '1.5',
                      textAlign: 'center',
                      color: selectedPeriod === 'Daily' ? '#333333' : '#FFFFFF',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      border: selectedPeriod === 'Daily' ? 'none' : '1px solid #444'
                    }}
                  >
                    Daily
                  </div>
                  <div 
                    onClick={() => setSelectedPeriod('Weekly')}
                    style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '10px 16px',
                      minWidth: 80,
                      height: 'auto',
                      minHeight: 44,
                      background: selectedPeriod === 'Weekly' ? colors.accent : 'transparent',
                      borderRadius: 8,
                      fontFamily: 'Poppins',
                      fontWeight: selectedPeriod === 'Weekly' ? 500 : 400,
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      lineHeight: '1.5',
                      textAlign: 'center',
                      color: selectedPeriod === 'Weekly' ? '#333333' : '#FFFFFF',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      border: selectedPeriod === 'Weekly' ? 'none' : '1px solid #444'
                    }}
                  >
                    Weekly
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                minWidth: 100,
                height: 'auto',
                minHeight: 44,
                border: `1px solid ${colors.accent}`,
                borderRadius: 8,
                color: colors.accent,
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: 'clamp(14px, 3vw, 16px)',
                lineHeight: '1.5',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}>
                <svg width="18.12" height="18.12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill={colors.accent} />
                  <path d="M5 20H19V18H5V20Z" fill={colors.accent} />
                </svg>
                Export
              </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ 
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              marginBottom: 16,
              flexWrap: 'wrap'
            }}>
              <style>{`
                @media (min-width: 1024px) {
                  .legend-container {
                    position: absolute;
                    left: 30px;
                    top: 91px;
                    gap: 25px !important;
                  }
                }
              `}</style>
              <div className="legend-container" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7.48 }}>
                <div style={{ 
                  width: 28.18, 
                  height: 10.07, 
                  background: colors.accent, 
                  borderRadius: 100.657 
                }} />
                <span style={{ 
                  fontFamily: 'Poppins',
                  fontWeight: 300,
                  fontSize: 16.1051,
                  lineHeight: '24px',
                  color: '#FFFFFF'
                }}>
                  Sales
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7.48 }}>
                <div style={{ 
                  width: 28.18, 
                  height: 10.07, 
                  background: '#D9D9D9', 
                  borderRadius: 100.657 
                }} />
                <span style={{ 
                  fontFamily: 'Poppins',
                  fontWeight: 300,
                  fontSize: 16.1051,
                  lineHeight: '24px',
                  color: '#FFFFFF'
                }}>
                  Revenue
                </span>
              </div>
              </div>
            </div>

            {/* Chart Area */}
            <div style={{ 
              position: 'relative',
              width: '100%',
              height: 'auto',
              minHeight: 250,
              marginTop: 16
            }}>
              <style>{`
                @media (min-width: 768px) {
                  .chart-area {
                    min-height: 280px !important;
                  }
                }
                @media (min-width: 1024px) {
                  .chart-area {
                    position: absolute;
                    left: 30px;
                    top: 142px;
                    width: calc(100% - 60px) !important;
                    min-height: 269px !important;
                  }
                }
              `}</style>
              <div className="chart-area" style={{ position: 'relative', width: '100%', minHeight: 250 }}>
              {/* Grid Lines */}
              <div style={{ 
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ 
                    width: '100%',
                    height: 0,
                    borderTop: '1.44533px solid #444444'
                  }} />
                ))}
              </div>

              {/* Y-axis Labels */}
              <div style={{ position: 'absolute', width: 19.05, height: 293.08, left: 1107.69, top: -12.96 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '26px', color: '#FFFFFF', textAlign: 'right', width: '100%' }}>5k</div>
                <div style={{ position: 'absolute', left: 0, top: 52.69, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '26px', color: '#FFFFFF', textAlign: 'right', width: '100%' }}>4k</div>
                <div style={{ position: 'absolute', left: 1.01, top: 106.04, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '26px', color: '#FFFFFF', textAlign: 'right', width: '100%' }}>3k</div>
                <div style={{ position: 'absolute', left: 1.01, top: 159.38, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '26px', color: '#FFFFFF', textAlign: 'right', width: '100%' }}>2k</div>
                <div style={{ position: 'absolute', left: 5.03, top: 212.73, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '26px', color: '#FFFFFF', textAlign: 'right', width: '100%' }}>1k</div>
                <div style={{ position: 'absolute', left: 8.05, top: 266.08, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '26px', color: '#FFFFFF', textAlign: 'right', width: '100%' }}>0</div>
              </div>

              {/* Sales Line with Gradient */}
              <div style={{ 
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.accent} 48.25%, ${colors.accent} 103.37%)`,
                mixBlendMode: 'multiply',
                opacity: 0.33
              }} />
              
              {/* Sales Line */}
              <svg style={{ 
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%'
              }}>
                <path 
                  d={selectedPeriod === 'Monthly' 
                    ? "M 0 200 Q 100 150 200 180 T 400 120 T 600 140 T 800 100 T 1000 160"
                    : selectedPeriod === 'Daily'
                    ? "M 0 180 Q 150 120 300 160 T 600 100 T 900 140 T 1000 120"
                    : "M 0 220 Q 200 180 400 200 T 800 160 T 1000 180"
                  }
                  stroke={colors.accent} 
                  strokeWidth="4.33599" 
                  fill="none"
                />
                {/* Indicator line */}
                <line 
                  x1={selectedPeriod === 'Monthly' ? "773.36" : selectedPeriod === 'Daily' ? "510" : "610"}
                  y1={selectedPeriod === 'Monthly' ? "182.96" : selectedPeriod === 'Daily' ? "140" : "200"}
                  x2={selectedPeriod === 'Monthly' ? "773.36" : selectedPeriod === 'Daily' ? "510" : "610"}
                  y2="420.72" 
                  stroke={colors.accent} 
                  strokeWidth="1.44533"
                />
              </svg>

              {/* Revenue Line */}
              <svg style={{ 
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%'
              }}>
                <path 
                  d={selectedPeriod === 'Monthly' 
                    ? "M 0 250 Q 100 220 200 240 T 400 200 T 600 220 T 800 180 T 1000 200"
                    : selectedPeriod === 'Daily'
                    ? "M 0 220 Q 150 200 300 220 T 600 180 T 900 200 T 1000 190"
                    : "M 0 240 Q 200 220 400 240 T 800 200 T 1000 220"
                  }
                  stroke="#D9D9D9" 
                  strokeWidth="2.01314" 
                  fill="none"
                />
              </svg>
            </div>

            {/* X-axis Labels */}
            <div style={{ 
              position: 'relative',
              width: '100%',
              height: 'auto',
              marginTop: 16,
              overflowX: 'auto'
            }}>
              <style>{`
                @media (min-width: 1024px) {
                  .x-axis-labels {
                    position: absolute;
                    width: calc(100% - 60px);
                    left: 32px;
                    top: 440px;
                  }
                }
              `}</style>
              <div className="x-axis-labels" style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', minWidth: 600 }}>
              {selectedPeriod === 'Monthly' ? (
                <>
                  <div style={{ position: 'absolute', left: 0, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>JAN</div>
                  <div style={{ position: 'absolute', left: 93.61, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>FEB</div>
                  <div style={{ position: 'absolute', left: 182.19, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>MAR</div>
                  <div style={{ position: 'absolute', left: 279.83, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>APR</div>
                  <div style={{ position: 'absolute', left: 372.43, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>MAY</div>
                  <div style={{ position: 'absolute', left: 469.06, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>JUN</div>
                  <div style={{ position: 'absolute', left: 562.68, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>JUL</div>
                  <div style={{ position: 'absolute', left: 652.26, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>AUG</div>
                  <div style={{ position: 'absolute', left: 748.89, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>SEP</div>
                  <div style={{ position: 'absolute', left: 838.48, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>OCT</div>
                  <div style={{ position: 'absolute', left: 935.11, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>NOV</div>
                  <div style={{ position: 'absolute', left: 1032.74, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>DEC</div>
                </>
              ) : selectedPeriod === 'Daily' ? (
                <>
                  <div style={{ position: 'absolute', left: 0, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>MON</div>
                  <div style={{ position: 'absolute', left: 120, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>TUE</div>
                  <div style={{ position: 'absolute', left: 240, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>WED</div>
                  <div style={{ position: 'absolute', left: 360, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>THU</div>
                  <div style={{ position: 'absolute', left: 480, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>FRI</div>
                  <div style={{ position: 'absolute', left: 600, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>SAT</div>
                  <div style={{ position: 'absolute', left: 720, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>SUN</div>
                </>
              ) : (
                <>
                  <div style={{ position: 'absolute', left: 0, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>W1</div>
                  <div style={{ position: 'absolute', left: 200, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>W2</div>
                  <div style={{ position: 'absolute', left: 400, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>W3</div>
                  <div style={{ position: 'absolute', left: 600, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>W4</div>
                  <div style={{ position: 'absolute', left: 800, top: 0, fontFamily: 'Poppins', fontWeight: 400, fontSize: 16, lineHeight: '23px', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>W5</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


