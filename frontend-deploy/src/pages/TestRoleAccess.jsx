import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';

export default function TestRoleAccess() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then(response => {
        console.log('User info:', response.user);
        setUser(response.user);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to get user info:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading user info...</div>;
  }

  if (!user) {
    return <div>No user found. Please login.</div>;
  }

  return (
    <div style={{ padding: '20px', background: '#111315', color: '#FFFFFF', minHeight: '100vh' }}>
      {/* Back Navigation Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#292C2D',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#3D4142';
            e.target.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#292C2D';
            e.target.style.transform = 'translateX(0)';
          }}
        >
          <span style={{ fontSize: '16px' }}>←</span>
          Back to Dashboard
        </button>
      </div>

      <h1 style={{ margin: '0 0 20px 0', fontSize: '28px', fontWeight: '600' }}>Role Access Test</h1>
      <div style={{ background: '#292C2D', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
        <h2>Current User Info:</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
      </div>

      <div style={{ background: '#292C2D', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
        <h2>Access Level:</h2>
        {user.role === 'ADMIN' && (
          <div style={{ color: '#FAC1D9' }}>
            <h3>🔓 ADMIN - Full Access</h3>
            <p>You can access all features:</p>
            <ul>
              <li>✅ Dashboard</li>
              <li>✅ Menu</li>
              <li>✅ Staff Management</li>
              <li>✅ Inventory</li>
              <li>✅ Reports</li>
              <li>✅ Orders/Table</li>
              <li>✅ Reservations</li>
              <li>✅ Profile</li>
              <li>✅ Notifications</li>
            </ul>
          </div>
        )}
        
        {user.role === 'STAFF' && (
          <div style={{ color: '#FAC1D9' }}>
            <h3>🔓 STAFF - Operational Access</h3>
            <p>You can access operational features:</p>
            <ul>
              <li>✅ Dashboard</li>
              <li>✅ Menu</li>
              <li>✅ Staff Management</li>
              <li>✅ Inventory</li>
              <li>❌ Reports (Admin only)</li>
              <li>✅ Orders/Table</li>
              <li>✅ Reservations</li>
              <li>✅ Profile</li>
              <li>✅ Notifications</li>
            </ul>
          </div>
        )}
        
        {user.role === 'USER' && (
          <div style={{ color: '#FAC1D9' }}>
            <h3>🔓 USER - Customer Access</h3>
            <p>You can access customer features:</p>
            <ul>
              <li>✅ Dashboard</li>
              <li>✅ Menu</li>
              <li>❌ Staff Management (Staff/Admin only)</li>
              <li>❌ Inventory (Staff/Admin only)</li>
              <li>❌ Reports (Admin only)</li>
              <li>✅ Orders/Table</li>
              <li>✅ Reservations</li>
              <li>✅ Profile</li>
              <li>✅ Notifications</li>
            </ul>
          </div>
        )}
      </div>

      <div style={{ background: '#292C2D', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
        <h2>Quick Navigation Test:</h2>
        <p>Click these links to test role-based access:</p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '12px',
          marginTop: '16px'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#FAC1D9',
              border: 'none',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#F8B3D1'}
            onMouseLeave={(e) => e.target.style.background = '#FAC1D9'}
          >
            📊 Dashboard
          </button>
          
          <button
            onClick={() => navigate('/menu')}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#FAC1D9',
              border: 'none',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#F8B3D1'}
            onMouseLeave={(e) => e.target.style.background = '#FAC1D9'}
          >
            📋 Menu
          </button>
          
          <button
            onClick={() => navigate('/staff')}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: user.role === 'USER' ? '#FF4444' : '#FAC1D9',
              border: 'none',
              color: user.role === 'USER' ? '#FFFFFF' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (user.role !== 'USER') {
                e.target.style.background = '#F8B3D1';
              }
            }}
            onMouseLeave={(e) => {
              if (user.role !== 'USER') {
                e.target.style.background = '#FAC1D9';
              }
            }}
          >
            👥 Staff {user.role === 'USER' ? '(Restricted)' : ''}
          </button>
          
          <button
            onClick={() => navigate('/inventory')}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: user.role === 'USER' ? '#FF4444' : '#FAC1D9',
              border: 'none',
              color: user.role === 'USER' ? '#FFFFFF' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (user.role !== 'USER') {
                e.target.style.background = '#F8B3D1';
              }
            }}
            onMouseLeave={(e) => {
              if (user.role !== 'USER') {
                e.target.style.background = '#FAC1D9';
              }
            }}
          >
            📦 Inventory {user.role === 'USER' ? '(Restricted)' : ''}
          </button>
          
          <button
            onClick={() => navigate('/reports')}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: user.role !== 'ADMIN' ? '#FF4444' : '#FAC1D9',
              border: 'none',
              color: user.role !== 'ADMIN' ? '#FFFFFF' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (user.role === 'ADMIN') {
                e.target.style.background = '#F8B3D1';
              }
            }}
            onMouseLeave={(e) => {
              if (user.role === 'ADMIN') {
                e.target.style.background = '#FAC1D9';
              }
            }}
          >
            📈 Reports {user.role !== 'ADMIN' ? '(Admin only)' : ''}
          </button>
          
          <button
            onClick={() => navigate('/orders')}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#FAC1D9',
              border: 'none',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#F8B3D1'}
            onMouseLeave={(e) => e.target.style.background = '#FAC1D9'}
          >
            🍽️ Orders
          </button>
          
          <button
            onClick={() => navigate('/reservation')}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#FAC1D9',
              border: 'none',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#F8B3D1'}
            onMouseLeave={(e) => e.target.style.background = '#FAC1D9'}
          >
            📅 Reservations
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#FAC1D9',
              border: 'none',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#F8B3D1'}
            onMouseLeave={(e) => e.target.style.background = '#FAC1D9'}
          >
            👤 Profile
          </button>
        </div>
      </div>
    </div>
  );
}
