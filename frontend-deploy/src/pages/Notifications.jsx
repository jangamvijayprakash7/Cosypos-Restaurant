import React, { useState, useEffect } from 'react';
import { Bell, User, Trash2, AlertTriangle, ShoppingCart, CreditCard, UserCheck, Package, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import Sidebar from './Sidebar.jsx';
import HeaderBar from './HeaderBar.jsx';

const colors = { 
  bg: '#111315', 
  text: '#FFFFFF', 
  panel: '#292C2D',
  accent: '#FAC1D9',
  muted: '#777979',
  line: '#3D4142'
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Order Placed',
      message: 'Order #1001 has been placed by Sarah Johnson for $67.50. Items: Chicken Parmesan, Caesar Salad.',
      date: '19/01/25',
      isRead: false,
      type: 'order',
      category: 'order'
    },
    {
      id: 2,
      title: 'Payment Received',
      message: 'Payment of $67.50 has been processed for Order #1001. Payment method: Credit Card.',
      date: '19/01/25',
      isRead: false,
      type: 'payment',
      category: 'payment'
    },
    {
      id: 3,
      title: 'Profile Updated',
      message: 'John Smith has updated their profile information. New email: john.smith@email.com',
      date: '19/01/25',
      isRead: false,
      type: 'profile',
      category: 'profile'
    },
    {
      id: 4,
      title: 'Order Completed',
      message: 'Order #1000 has been completed and delivered to customer. Total: $89.25',
      date: '18/01/25',
      isRead: false,
      type: 'order',
      category: 'order'
    },
    {
      id: 5,
      title: 'Payment Failed',
      message: 'Payment for Order #999 failed. Amount: $45.00. Please contact customer for alternative payment.',
      date: '18/01/25',
      isRead: false,
      type: 'payment',
      category: 'payment'
    },
    {
      id: 6,
      title: 'Profile Image Updated',
      message: 'Maria Garcia has updated their profile picture.',
      date: '18/01/25',
      isRead: true,
      type: 'profile',
      category: 'profile'
    },
    {
      id: 7,
      title: 'New Order Placed',
      message: 'Order #998 has been placed by David Wilson for $123.75. Items: Beef Lasagna, Margherita Pizza.',
      date: '17/01/25',
      isRead: true,
      type: 'order',
      category: 'order'
    },
    {
      id: 8,
      title: 'Payment Completed',
      message: 'Payment of $123.75 has been processed for Order #998. Transaction ID: TXN789456123',
      date: '17/01/25',
      isRead: true,
      type: 'payment',
      category: 'payment'
    },
    {
      id: 9,
      title: 'Profile Information Changed',
      message: 'Lisa Brown has updated their contact information and preferences.',
      date: '17/01/25',
      isRead: true,
      type: 'profile',
      category: 'profile'
    },
    {
      id: 10,
      title: 'Low Inventory Alert',
      message: 'Chicken Parmesan stock is running low (3 items remaining). Please restock soon.',
      date: '16/01/25',
      isRead: true,
      type: 'warning',
      category: 'system'
    },
    {
      id: 11,
      title: 'Order Cancelled',
      message: 'Order #997 has been cancelled by customer. Refund of $56.00 will be processed.',
      date: '16/01/25',
      isRead: true,
      type: 'order',
      category: 'order'
    },
    {
      id: 12,
      title: 'Profile Verification',
      message: 'New customer Alex Thompson has completed profile verification.',
      date: '16/01/25',
      isRead: true,
      type: 'profile',
      category: 'profile'
    }
  ]);

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      isRead: true
    })));
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !notification.isRead;
    if (activeFilter === 'Orders') return notification.category === 'order';
    if (activeFilter === 'Payments') return notification.category === 'payment';
    if (activeFilter === 'Profiles') return notification.category === 'profile';
    if (activeFilter === 'System') return notification.category === 'system';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, overflowX: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative' }}>
        <Sidebar />
        <HeaderBar title="Notification" showBackButton={true} right={(
          <>
            {/* Notification Bell Container */}
            <div style={{ position: 'relative' }}>
              {/* Notification Bell */}
              <div 
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

        <main className="page-main-content" style={{ 
          padding: '20px 24px'
        }}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32
          }}>
            <div>
              <h1 style={{
                color: colors.text,
                fontSize: 28,
                fontWeight: 600,
                marginBottom: 8
              }}>
                Notifications
              </h1>
              <p style={{
                color: colors.muted,
                fontSize: 16
              }}>
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Mark All as Read Button */}
            <button 
              onClick={handleMarkAllAsRead}
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
              Mark all as read
            </button>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            marginBottom: 24,
            background: colors.bg,
            padding: 4,
            borderRadius: 8,
            width: 'fit-content'
          }}>
            {['All', 'Unread', 'Orders', 'Payments', 'Profiles', 'System'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  background: activeFilter === filter ? colors.accent : 'transparent',
                  border: 'none',
                  color: activeFilter === filter ? '#333333' : colors.text,
                  padding: '12px 24px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: 80
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== filter) {
                    e.target.style.background = colors.muted;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== filter) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{
            background: colors.panel,
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            {filteredNotifications.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                color: colors.muted,
                fontSize: 16
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
                <div>No notifications found</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>
                  {activeFilter === 'Unread' ? 'No unread notifications' : 'No notifications available'}
                </div>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <div key={notification.id} style={{
                  padding: 20,
                  borderBottom: index < filteredNotifications.length - 1 ? `1px solid ${colors.line}` : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  background: notification.isRead ? 'transparent' : `${colors.accent}15`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = notification.isRead ? `${colors.muted}20` : `${colors.accent}25`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = notification.isRead ? 'transparent' : `${colors.accent}15`;
                }}
                onClick={() => {
                  if (!notification.isRead) {
                    setNotifications(prev => prev.map(n => 
                      n.id === notification.id ? { ...n, isRead: true } : n
                    ));
                  }
                }}>
                  {/* Notification Icon */}
                  <div style={{
                    width: 40,
                    height: 40,
                    background: notification.type === 'warning' ? colors.accent : 
                               notification.type === 'order' ? '#2196F3' : 
                               notification.type === 'payment' ? '#4CAF50' : 
                               notification.type === 'profile' ? '#FF9800' : 
                               notification.type === 'success' ? '#4CAF50' : 
                               notification.type === 'info' ? '#2196F3' : colors.accent,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {notification.type === 'warning' ? (
                      <AlertTriangle size={20} color="#333333" />
                    ) : notification.type === 'order' ? (
                      <ShoppingCart size={20} color="#FFFFFF" />
                    ) : notification.type === 'payment' ? (
                      <CreditCard size={20} color="#FFFFFF" />
                    ) : notification.type === 'profile' ? (
                      <UserCheck size={20} color="#FFFFFF" />
                    ) : notification.type === 'success' ? (
                      <CheckCircle size={20} color="#FFFFFF" />
                    ) : (
                      <Bell size={16} color="#FFFFFF" />
                    )}
                  </div>

                  {/* Notification Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4
                    }}>
                      <h3 style={{
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: 600,
                        margin: 0
                      }}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div style={{
                          width: 8,
                          height: 8,
                          background: colors.accent,
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                    <p style={{
                      color: colors.muted,
                      fontSize: 14,
                      lineHeight: '20px',
                      margin: 0
                    }}>
                      {notification.message}
                    </p>
                  </div>

                  {/* Date */}
                  <div style={{
                    color: colors.muted,
                    fontSize: 12,
                    marginRight: 16,
                    minWidth: 60,
                    textAlign: 'right'
                  }}>
                    {notification.date}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
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
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
