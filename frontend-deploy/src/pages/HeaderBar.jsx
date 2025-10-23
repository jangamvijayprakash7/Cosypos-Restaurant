import { useNavigate } from 'react-router-dom'

const colors = {
  panel: '#292C2D',
  text: '#FFFFFF',
}

export default function HeaderBar({ title, right, showBackButton = false, onBackClick }) {
  const navigate = useNavigate()
  
  const handleBack = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      navigate(-1)
    }
  }
  
  return (
    <header className="header-responsive" style={{ 
      marginLeft: 0,
      paddingLeft: 60,
      paddingRight: 16, 
      paddingTop: 16, 
      paddingBottom: 16,
      display: 'flex', 
      alignItems: 'center', 
      gap: 12,
      background: '#111315',
      borderBottom: '1px solid #3D4142',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999
    }}>
      <style>{`
        @media (min-width: 768px) {
          .header-responsive {
            padding-left: 70px !important;
            padding-right: 24px !important;
            gap: 16px !important;
          }
        }
        @media (min-width: 1024px) {
          .header-responsive {
            margin-left: 208px !important;
            padding-left: 20px !important;
            padding-right: 32px !important;
            padding-top: 40px !important;
            padding-bottom: 20px !important;
            position: relative !important;
          }
        }
      `}</style>
      {showBackButton && (
        <button 
          onClick={handleBack}
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: colors.panel, 
            border: 'none',
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          &lt;
        </button>
      )}
      <div style={{ 
        fontSize: 'clamp(18px, 4vw, 25px)', 
        fontWeight: 500, 
        color: colors.text,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 1
      }}>{title}</div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {right}
      </div>
    </header>
  )
}


