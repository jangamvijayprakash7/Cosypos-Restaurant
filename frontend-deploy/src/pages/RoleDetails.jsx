import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';
import '../styles/animations.css';

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  accent: '#FAC1D9',
  text: '#FFFFFF',
  muted: '#777979',
  success: '#50CD89',
  warning: '#FFA500',
  error: '#FF4444',
};

function RoleBadge({ role }) {
  const getRoleConfig = (role) => {
    switch (role) {
      case 'ADMIN':
        return {
          color: colors.accent,
          bgColor: 'rgba(250, 193, 217, 0.1)',
          borderColor: colors.accent,
          icon: '👑',
          label: 'Administrator'
        };
      case 'STAFF':
        return {
          color: colors.success,
          bgColor: 'rgba(80, 205, 137, 0.1)',
          borderColor: colors.success,
          icon: '👨‍💼',
          label: 'Staff Member'
        };
      case 'USER':
        return {
          color: colors.warning,
          bgColor: 'rgba(255, 165, 0, 0.1)',
          borderColor: colors.warning,
          icon: '👤',
          label: 'Customer'
        };
      default:
        return {
          color: colors.muted,
          bgColor: 'rgba(119, 121, 121, 0.1)',
          borderColor: colors.muted,
          icon: '❓',
          label: 'Unknown'
        };
    }
  };

  const config = getRoleConfig(role);

  return (
    <div 
      className="role-badge"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 20,
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        fontSize: 12,
        fontWeight: 500,
        color: config.color
      }}
    >
      <span>{config.label}</span>
    </div>
  );
}

function AccessIndicator({ hasAccess, feature }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 8px',
      borderRadius: 6,
      background: hasAccess ? 'rgba(80, 205, 137, 0.1)' : 'rgba(255, 68, 68, 0.1)',
      fontSize: 12,
      color: hasAccess ? colors.success : colors.error
    }}>
      <span style={{ fontSize: 10 }}>{hasAccess ? '✓' : '✗'}</span>
      <span>{feature}</span>
    </div>
  );
}

export default function RoleDetails() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then(response => {
        setUser(response.user);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to get user info:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 8,
        background: colors.panel,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}>
        <span style={{ fontSize: 12, color: colors.muted }}>Loading...</span>
      </div>
    );
  }

  const getAccessLevel = (role) => {
    switch (role) {
      case 'ADMIN':
        return {
          level: 'Full Access',
          description: 'Complete system control and management capabilities',
          features: [
            { name: 'Dashboard', access: true },
            { name: 'Menu Management', access: true },
            { name: 'Staff Management', access: true },
            { name: 'Inventory Control', access: true },
            { name: 'Reports & Analytics', access: true },
            { name: 'Order Management', access: true },
            { name: 'Reservations', access: true },
            { name: 'User Management', access: true }
          ]
        };
      case 'STAFF':
        return {
          level: 'Operational Access',
          description: 'Day-to-day operational features for restaurant staff',
          features: [
            { name: 'Dashboard', access: true },
            { name: 'Menu Management', access: true },
            { name: 'Staff Management', access: true },
            { name: 'Inventory Control', access: true },
            { name: 'Reports & Analytics', access: false },
            { name: 'Order Management', access: true },
            { name: 'Reservations', access: true },
            { name: 'User Management', access: false }
          ]
        };
      case 'USER':
        return {
          level: 'Customer Access',
          description: 'Customer-facing features for dining experience',
          features: [
            { name: 'Dashboard', access: true },
            { name: 'Menu Management', access: true },
            { name: 'Staff Management', access: false },
            { name: 'Inventory Control', access: false },
            { name: 'Reports & Analytics', access: false },
            { name: 'Order Management', access: true },
            { name: 'Reservations', access: true },
            { name: 'User Management', access: false }
          ]
        };
      default:
        return {
          level: 'No Access',
          description: 'Limited or no system access',
          features: []
        };
    }
  };

  const accessInfo = getAccessLevel(user.role);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>

      {/* Role Details Button */}
      <button
        className="role-details-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 8,
          background: isOpen ? colors.accent : colors.panel,
          border: 'none',
          color: isOpen ? '#333' : colors.text,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: 14,
          fontWeight: 500
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.target.style.background = '#3D4142';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.target.style.background = colors.panel;
          }
        }}
      >
        <RoleBadge role={user.role} />
        <span style={{ fontSize: 12, color: isOpen ? '#333' : colors.muted }}>
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {/* Role Details Panel */}
      {isOpen && (
        <div 
          className="role-details-panel"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            width: 400,
            background: colors.panel,
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            border: `1px solid ${colors.accent}`,
            zIndex: 1000
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: colors.text
              }}>
                Role Information
              </h3>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: 12,
                color: colors.muted
              }}>
                {user.name} • {user.email}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                color: colors.muted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }}
            >
              ×
            </button>
          </div>

          {/* Role Badge */}
          <div style={{ marginBottom: 16 }}>
            <RoleBadge role={user.role} />
          </div>

          {/* Access Level */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: 14,
              fontWeight: 600,
              color: colors.text
            }}>
              Access Level: {accessInfo.level}
            </h4>
            <p style={{
              margin: 0,
              fontSize: 12,
              color: colors.muted,
              lineHeight: '18px'
            }}>
              {accessInfo.description}
            </p>
          </div>

          {/* Features Access */}
          <div>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: 14,
              fontWeight: 600,
              color: colors.text
            }}>
              Feature Access
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8
            }}>
              {accessInfo.features.map((feature, index) => (
                <AccessIndicator
                  key={index}
                  hasAccess={feature.access}
                  feature={feature.name}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${colors.muted}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: 11,
              color: colors.muted
            }}>
              Last updated: {new Date().toLocaleDateString()}
            </span>
            <button
              onClick={() => navigate('/test-role')}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                background: 'transparent',
                border: `1px solid ${colors.accent}`,
                color: colors.accent,
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = colors.accent;
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = colors.accent;
              }}
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Profile Dropdown Panel */}
      {showProfile && (
        <div 
          className="profile-dropdown-panel"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            width: 280,
            background: colors.panel,
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            border: `1px solid ${colors.accent}`,
            zIndex: 1000
          }}
        >
          {/* Profile Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            paddingBottom: 16,
            borderBottom: `1px solid ${colors.muted}`
          }}>
            {/* Profile Avatar */}
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: colors.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              color: '#333'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: colors.text
              }}>
                {user.name}
              </h3>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: 12,
                color: colors.muted
              }}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Profile Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => {
                setShowProfile(false);
                navigate('/profile');
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: `1px solid ${colors.accent}`,
                color: colors.accent,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                e.target.style.background = colors.accent;
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = colors.accent;
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="currentColor"/>
                <path d="M12 14C7.58 14 4 17.58 4 22H20C20 17.58 16.42 14 12 14Z" fill="currentColor"/>
              </svg>
              View Profile
            </button>
            
            <button
              onClick={() => {
                setShowProfile(false);
                navigate('/my-profile');
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: `1px solid ${colors.muted}`,
                color: colors.text,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#3D4142';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z" fill="currentColor"/>
              </svg>
              Edit Profile
            </button>

            {/* Manage Access - Admin Only */}
            {user.role === 'ADMIN' && (
              <button
                onClick={() => {
                  setShowProfile(false);
                  navigate('/manage-access');
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: `1px solid ${colors.accent}`,
                  color: colors.accent,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = colors.accent;
                  e.target.style.color = '#333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = colors.accent;
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 16.5 6.5 20.5 12 22C17.5 20.5 20 16.5 20 12V6L12 2Z" fill="currentColor" opacity="0.9"/>
                  <path d="M9 12L11 14L15 10" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="8" r="2" fill="#FFFFFF"/>
                </svg>
                Manage Access
              </button>
            )}
          </div>

          {/* Role Badge in Profile */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <RoleBadge role={user.role} />
          </div>
        </div>
      )}

      {/* Backdrop for Role Details */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 999
          }}
        />
      )}

      {/* Backdrop for Profile */}
      {showProfile && (
        <div
          onClick={() => setShowProfile(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 999
          }}
        />
      )}
    </div>
  );
}
