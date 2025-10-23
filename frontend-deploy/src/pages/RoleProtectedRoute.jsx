import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';
import RestrictedAccess from './RestrictedAccess';

export default function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Safety timeout - if auth check takes too long, fail gracefully
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ Auth check timeout - redirecting to login');
        setError('Authentication timeout');
        setLoading(false);
      }
    }, 15000); // 15 second timeout for auth

    getCurrentUser()
      .then(response => {
        if (mounted) {
          clearTimeout(timeoutId);
          setUser(response.user);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          clearTimeout(timeoutId);
          console.error('Failed to get user info:', err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#111315',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{
          color: '#FAC1D9',
          fontSize: 18,
          fontWeight: 500
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <RestrictedAccess />;
  }

  return children;
}
