import React, { useEffect } from 'react';

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  accent: '#FAC1D9',
  text: '#FFFFFF',
  muted: '#777979',
  success: '#FAC1D9',  // Pink for success to match theme
  error: '#FF6B9D',    // Lighter pink/red for errors
  warning: '#FFB6C1',  // Light pink for warnings
  info: '#E8A8C8'      // Muted pink for info
};

const typeStyles = {
  success: {
    icon: <span style={{ fontSize: 24 }}>✓</span>,
    borderColor: colors.success,
    iconColor: colors.success
  },
  error: {
    icon: <span style={{ fontSize: 24 }}>✕</span>,
    borderColor: colors.error,
    iconColor: colors.error
  },
  warning: {
    icon: <span style={{ fontSize: 24 }}>⚠</span>,
    borderColor: colors.warning,
    iconColor: colors.warning
  },
  info: {
    icon: <span style={{ fontSize: 24 }}>ℹ</span>,
    borderColor: colors.info,
    iconColor: colors.info
  }
};

export default function Toast({ show, message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const style = typeStyles[type] || typeStyles.success;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          minWidth: 320,
          maxWidth: 500,
          background: colors.panel,
          borderRadius: 12,
          border: `2px solid ${style.borderColor}`,
          padding: 18,
          boxShadow: '0 10px 40px rgba(250, 193, 217, 0.2), 0 4px 12px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          animation: 'slideInRight 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          backdropFilter: 'blur(10px)',
          fontFamily: 'Poppins, sans-serif'
        }}
      >
        {/* Icon */}
        <div style={{ color: style.iconColor, flexShrink: 0 }}>
          {style.icon}
        </div>

        {/* Message */}
        <div style={{ 
          flex: 1, 
          color: colors.text, 
          fontSize: 14, 
          fontWeight: 500,
          lineHeight: '1.5'
        }}>
          {message}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            background: 'rgba(119, 121, 121, 0.2)',
            border: 'none',
            color: colors.muted,
            fontSize: 18,
            cursor: 'pointer',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            borderRadius: '50%',
            width: 28,
            height: 28
          }}
          onMouseEnter={(e) => {
            e.target.style.color = colors.text;
            e.target.style.background = 'rgba(250, 193, 217, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = colors.muted;
            e.target.style.background = 'rgba(119, 121, 121, 0.2)';
          }}
        >
          ✕
        </button>
      </div>
    </>
  );
}
