import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../utils/api';
import { useUser } from './UserContext';
import Toast from '../components/Toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('...');
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.token);
      updateUser(res.user);
      setMsg('');
      showToast(`Successfully logged in as ${res.user.role}!`, 'success');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (error) {
      setMsg('');
      
      // Show specific error message based on error type
      let errorMessage = error.message || 'An unexpected error occurred';
      let errorType = 'error';
      
      // Network error
      if (error.isNetworkError) {
        errorType = 'error';
        errorMessage = '🌐 ' + errorMessage;
      } 
      // Timeout error
      else if (error.isTimeout) {
        errorType = 'warning';
        errorMessage = '⏱️ ' + errorMessage;
      }
      // Authentication error (wrong credentials)
      else if (error.status === 401) {
        errorType = 'error';
        errorMessage = '🔒 ' + errorMessage;
      }
      // Server error
      else if (error.status >= 500) {
        errorType = 'error';
        errorMessage = '⚠️ ' + errorMessage;
      }
      
      showToast(errorMessage, errorType);
    }
  }

  // Quick login for testing purposes
  async function quickLogin(role) {
    setMsg('Logging in as ' + role + '...');
    try {
      let credentials;
      
      // Set credentials based on role
      switch(role) {
        case 'ADMIN':
          credentials = { email: 'admin@cosypos.app', password: 'admin123' };
          break;
        case 'STAFF':
          credentials = { email: 'staff@cosypos.app', password: 'staff123' };
          break;
        case 'USER':
          credentials = { email: 'user@cosypos.app', password: 'user123' };
          break;
        default:
          throw new Error('Invalid role');
      }
      
      // Fill the form fields
      setEmail(credentials.email);
      setPassword(credentials.password);
      
      // Perform actual login
      const res = await login(credentials.email, credentials.password);
      localStorage.setItem('token', res.token);
      updateUser(res.user);
      setMsg('');
      showToast(`Successfully logged in as ${res.user.role}!`, 'success');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (error) {
      setMsg('');
      
      // Show specific error message based on error type
      let errorMessage = error.message || 'An unexpected error occurred';
      let errorType = 'error';
      
      // Network error
      if (error.isNetworkError) {
        errorType = 'error';
        errorMessage = '🌐 ' + errorMessage;
      } 
      // Timeout error
      else if (error.isTimeout) {
        errorType = 'warning';
        errorMessage = '⏱️ ' + errorMessage;
      }
      // Authentication error (wrong credentials)
      else if (error.status === 401) {
        errorType = 'error';
        errorMessage = '🔒 ' + errorMessage;
      }
      // Server error
      else if (error.status >= 500) {
        errorType = 'error';
        errorMessage = '⚠️ ' + errorMessage;
      }
      
      showToast(errorMessage, errorType);
    }
  }

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      background: '#000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden', 
      padding: 16 
    }}>
      <style>{`
        @media (min-width: 768px) {
          .login-container {
            padding: 24px !important;
          }
          .login-logo {
            font-size: 32px !important;
            top: 20px !important;
          }
          .login-card {
            padding: 40px !important;
            border-radius: 32px !important;
          }
        }
      `}</style>
      <div className="login-logo" style={{ 
        position: 'absolute', 
        top: 12, 
        left: 0, 
        right: 0, 
        textAlign: 'center', 
        fontWeight: 700, 
        color: '#FAC1D9', 
        fontSize: 'clamp(20px, 5vw, 28px)'
      }}>COSYPOS</div>
      <div className="login-card" style={{ 
        width: '100%', 
        maxWidth: 640, 
        background: '#292C2D', 
        borderRadius: 20, 
        color: '#fff', 
        padding: 24, 
        boxShadow: '0 20px 60px rgba(0,0,0,.5)' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          fontWeight: 500, 
          fontSize: 'clamp(28px, 6vw, 40px)', 
          marginTop: 8 
        }}>Login!</div>
        <div style={{ 
          textAlign: 'center', 
          marginTop: 8, 
          opacity: .9,
          fontSize: 'clamp(14px, 3vw, 16px)'
        }}>Please enter your credentials below to continue</div>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <div style={{ marginTop: 20 }}>
            <div style={{ 
              marginBottom: 8, 
              fontWeight: 500,
              fontSize: 'clamp(14px, 3vw, 16px)'
            }}>Username</div>
            <input 
              placeholder="Enter your username" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: 14, 
                borderRadius: 10, 
                border: 'none', 
                background: '#3D4142', 
                color: '#fff',
                fontSize: 'clamp(14px, 3vw, 16px)',
                minHeight: 44
              }} 
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ 
              marginBottom: 8, 
              fontWeight: 500,
              fontSize: 'clamp(14px, 3vw, 16px)'
            }}>Password</div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '14px 44px 14px 14px', 
                  borderRadius: 10, 
                  border: 'none', 
                  background: '#3D4142', 
                  color: '#fff',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  minHeight: 44
                }} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#FAC1D9',
                  cursor: 'pointer',
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#E8A8C8'}
                onMouseLeave={(e) => e.target.style.color = '#FAC1D9'}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%', 
            marginTop: 10,
            flexWrap: 'wrap',
            gap: 8
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              color: '#FAC1D9',
              fontSize: 'clamp(12px, 2.5vw, 14px)'
            }}>
              <input type="checkbox" style={{ accentColor: '#FAC1D9', minWidth: 16, minHeight: 16 }} /> Remember me
            </label>
            <Link to="/forgot" style={{ 
              color: '#FAC1D9', 
              textDecoration: 'underline',
              fontSize: 'clamp(12px, 2.5vw, 14px)'
            }}>Forgot Password?</Link>
          </div>
          <button style={{ 
            marginTop: 16, 
            alignSelf: 'center', 
            padding: '14px 32px', 
            borderRadius: 10, 
            background: '#FAC1D9', 
            border: 'none', 
            color: '#333', 
            fontWeight: 600,
            fontSize: 'clamp(14px, 3vw, 16px)',
            minHeight: 48,
            cursor: 'pointer'
          }}>Login</button>
        </form>
        
        {/* Quick Login Buttons for Testing */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #3D4142' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 12, 
            fontSize: 'clamp(12px, 2.5vw, 14px)', 
            opacity: 0.8 
          }}>
            Quick Login for Testing
          </div>
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => quickLogin('ADMIN')}
              style={{ 
                padding: '10px 18px', 
                borderRadius: 8, 
                background: '#FAC1D9', 
                border: 'none', 
                color: '#333', 
                fontWeight: 600,
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: 44,
                minWidth: 80
              }}
              onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
              onMouseLeave={(e) => e.target.style.background = '#FAC1D9'}
            >
              ADMIN
            </button>
            <button 
              onClick={() => quickLogin('STAFF')}
              style={{ 
                padding: '10px 18px', 
                borderRadius: 8, 
                background: '#4CAF50', 
                border: 'none', 
                color: '#fff', 
                fontWeight: 600,
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: 44,
                minWidth: 80
              }}
              onMouseEnter={(e) => e.target.style.background = '#45a049'}
              onMouseLeave={(e) => e.target.style.background = '#4CAF50'}
            >
              STAFF
            </button>
            <button 
              onClick={() => quickLogin('USER')}
              style={{ 
                padding: '10px 18px', 
                borderRadius: 8, 
                background: '#2196F3', 
                border: 'none', 
                color: '#fff', 
                fontWeight: 600,
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: 44,
                minWidth: 80
              }}
              onMouseEnter={(e) => e.target.style.background = '#1976D2'}
              onMouseLeave={(e) => e.target.style.background = '#2196F3'}
            >
              USER
            </button>
          </div>
        </div>
        
        <div style={{ 
          marginTop: 16, 
          fontSize: 'clamp(12px, 2.5vw, 14px)', 
          opacity: .85,
          textAlign: 'center'
        }}>{msg}</div>
      </div>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </div>
  );
}


