import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useUser } from './UserContext'
import HeaderBar from './HeaderBar'
import Sidebar from './Sidebar'
import MyProfile from './MyProfile'
import ManageAccess from './ManageAccess'

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  accent: '#FAC1D9',
  text: '#FFFFFF',
  muted: '#777979',
}

function ProfileIcon({ color = colors.accent }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="12" cy="8" r="3" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  )
}


export default function Profile() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [activeSection, setActiveSection] = useState('my-profile')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Ensure non-admin users can't access manage-access section
  React.useEffect(() => {
    if (activeSection === 'manage-access' && user?.role !== 'ADMIN') {
      setActiveSection('my-profile')
    }
  }, [activeSection, user?.role])

  const handleBack = () => {
    navigate(-1)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/', { replace: true })
  }

  const rightContent = (
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
  )

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg, 
      display: 'flex',
      fontFamily: 'Poppins, system-ui, sans-serif',
      overflow: 'hidden'
    }}>
      <style>{`
        .profile-container {
          flex: 1;
          margin-left: 0;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .profile-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
          overflow-y: auto;
          max-width: 100%;
        }
        @media (min-width: 768px) {
          .profile-content {
            padding: 20px 24px;
            gap: 24px;
          }
        }
        @media (min-width: 1024px) {
          .profile-container {
            margin-left: 176px;
          }
          .profile-content {
            padding: 20px 40px;
            flex-direction: row;
            gap: 32px;
            max-width: calc(100vw - 240px);
          }
        }
      `}</style>
      <Sidebar />
      
      <div className="profile-container">
        <HeaderBar 
          title="Profile" 
          showBackButton={true}
          onBackClick={handleBack}
          right={rightContent}
        />
        
        <div className="profile-content">
          {/* Profile Options Sidebar */}
          <div style={{
            width: '100%',
            maxWidth: 220,
            background: colors.panel,
            borderRadius: 12,
            padding: 20,
            height: 'fit-content',
            flexShrink: 0
          }}>
            <style>{`
              @media (min-width: 1024px) {
                .profile-sidebar {
                  margin-left: 20px;
                }
              }
            `}</style>
            <div className="profile-sidebar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => setActiveSection('my-profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: activeSection === 'my-profile' ? colors.accent : 'transparent',
                  border: 'none',
                  color: activeSection === 'my-profile' ? '#333333' : colors.text,
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <ProfileIcon color={activeSection === 'my-profile' ? '#333333' : colors.accent} />
                My Profile
              </button>
              
              {/* Manage Access button - only visible for ADMIN users */}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveSection('manage-access')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: activeSection === 'manage-access' ? colors.accent : 'transparent',
                    border: 'none',
                    color: activeSection === 'manage-access' ? '#333333' : colors.text,
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke={activeSection === 'manage-access' ? '#333333' : colors.accent} strokeWidth="2" fill="none"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={activeSection === 'manage-access' ? '#333333' : colors.accent} strokeWidth="2" fill="none"/>
                  </svg>
                  Manage Access
                </button>
              )}
              
              <button
                onClick={() => setShowLogoutConfirm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: 'none',
                  color: colors.text,
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={colors.text} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16,17 21,12 16,7" stroke={colors.text} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
          </div>
          
          {/* Main Content */}
          <div style={{ 
            flex: 1,
            overflow: 'auto',
            minWidth: 0
          }}>
            {activeSection === 'my-profile' && <MyProfile />}
            {activeSection === 'manage-access' && user?.role === 'ADMIN' && <ManageAccess />}
          </div>
        </div>
      </div>
      
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: colors.panel,
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: colors.text,
              marginBottom: 16
            }}>
              Confirm Logout
            </h3>
            <p style={{
              fontSize: 14,
              color: colors.muted,
              marginBottom: 24,
              lineHeight: '1.5'
            }}>
              Are you sure you want to logout? You will need to login again to access your account.
            </p>
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  background: 'transparent',
                  border: '1px solid #3D4142',
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#3D4142'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  background: '#FF4444',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#FF3333'}
                onMouseOut={(e) => e.target.style.background = '#FF4444'}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
