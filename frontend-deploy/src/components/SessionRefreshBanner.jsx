import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  accent: '#FAC1D9',
  text: '#FFFFFF',
}

/**
 * Banner that prompts users to refresh their session when permissions are updated
 */
export default function SessionRefreshBanner() {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if there's a pending permission update flag
    const pendingUpdate = sessionStorage.getItem('permissions_updated')
    if (pendingUpdate === 'true') {
      setShow(true)
    }
  }, [])

  const handleLogout = () => {
    // Clear all session data
    localStorage.removeItem('token')
    sessionStorage.removeItem('permissions_updated')
    
    // Redirect to login
    navigate('/', { replace: true })
  }

  const handleDismiss = () => {
    sessionStorage.removeItem('permissions_updated')
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid #FAC1D9',
      borderRadius: 12,
      padding: '16px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      maxWidth: '90%',
      width: '500px',
      animation: 'slideDown 0.3s ease-out'
    }}>
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: 2 }}>
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
          <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 700,
            color: 'white'
          }}>
            🔄 Session Refresh Required
          </h3>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.5
          }}>
            Your permissions have been updated. Please log out and log back in to apply the changes and access all your pages.
          </p>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleLogout}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              Log Out Now
            </button>
            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: 4,
            flexShrink: 0
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

