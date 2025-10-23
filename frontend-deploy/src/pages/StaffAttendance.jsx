import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import Sidebar from './Sidebar.jsx'
import HeaderBar from './HeaderBar.jsx'

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  text: '#FFFFFF',
  accent: '#FAC1D9',
  muted: '#777979'
}

export default function StaffAttendance() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
      <div style={{ width: '100%', margin: '0 auto', position: 'relative' }}>
        <Sidebar />
        <HeaderBar title="Attendance" showBackButton={true} right={(
          <>
            {/* Notification Bell Container */}
            <div style={{ position: 'relative' }}>
              {/* Notification Bell */}
              <div 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
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

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  background: colors.panel,
                  borderRadius: 8,
                  border: `1px solid ${colors.accent}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  zIndex: 1000,
                  minWidth: 200,
                  maxWidth: 300
                }}>
                  <div style={{ padding: 16 }}>
                    <div style={{ 
                      textAlign: 'center', 
                      color: colors.muted, 
                      fontSize: 14,
                      marginBottom: 12 
                    }}>
                      No notifications
                    </div>
                    <button 
                      onClick={() => setIsNotificationOpen(false)}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        background: colors.accent,
                        color: '#333333',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
                      onMouseLeave={(e) => e.target.style.background = colors.accent}
                    >
                      Show All
                    </button>
                  </div>
                </div>
              )}
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
                src="/profile img icon.jpg" 
                alt="Profile" 
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
              />
            </div>
          </>
        )} />
        <main style={{ paddingLeft: 208, paddingRight: 32, paddingTop: 20 }}>
          <div style={{ background: colors.panel, borderRadius: 10, padding: 24 }}>Coming soon</div>
        </main>
      </div>
    </div>
  )
}


