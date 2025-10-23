import { useNavigate } from 'react-router-dom';

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  accent: '#FAC1D9',
  text: '#FFFFFF',
  muted: '#777979',
};

export default function RestrictedAccess() {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: colors.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: colors.panel,
        borderRadius: 20,
        padding: 48,
        maxWidth: 500,
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,.5)'
      }}>
        {/* Lock Icon */}
        <div style={{
          width: 80,
          height: 80,
          background: colors.accent,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="4" y="10" width="16" height="10" rx="2" fill="#333"/>
            <circle cx="12" cy="15" r="2" fill="#FAC1D9"/>
          </svg>
        </div>

        <h1 style={{
          color: colors.text,
          fontSize: 28,
          fontWeight: 600,
          margin: '0 0 16px 0'
        }}>
          Access Restricted
        </h1>

        <p style={{
          color: colors.muted,
          fontSize: 16,
          lineHeight: '24px',
          margin: '0 0 32px 0'
        }}>
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              background: colors.accent,
              border: 'none',
              color: '#333',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#F8B3D1'}
            onMouseOut={(e) => e.target.style.background = colors.accent}
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              background: 'transparent',
              border: `2px solid ${colors.muted}`,
              color: colors.text,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = colors.muted;
              e.target.style.color = colors.text;
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = colors.text;
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
