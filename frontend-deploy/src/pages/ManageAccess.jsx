import { useState, useEffect } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import Toast from '../components/Toast.jsx'

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  accent: '#FAC1D9',
  text: '#FFFFFF',
  muted: '#777979',
}

function EyeIcon({ color = colors.muted }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  )
}


function ToggleSwitch({ checked, onChange, disabled = false }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: checked ? colors.accent : '#3D4142',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1
      }}
    >
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#FFFFFF',
        position: 'absolute',
        top: 2,
        left: checked ? 22 : 2,
        transition: 'left 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </button>
  )
}

export default function ManageAccess() {
  const [newUser, setNewUser] = useState({
    firstName: '',
    email: '',
    role: '',
    password: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null, title: '' })

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  // Confirmation dialog helper
  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ show: true, title, message, onConfirm })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, message: '', onConfirm: null, title: '' })
  }

  // ✅ Fetch real users from PostgreSQL
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded users from PostgreSQL:', data.length);
        
        // Transform permissions from JSON string to object
        const transformedUsers = data.map(user => ({
          ...user,
          permissions: user.permissions ? JSON.parse(user.permissions) : {
            dashboard: true,
            menu: true,
            orders: true,
            reservation: true,
            staff: false,
            inventory: false,
            reports: false
          }
        }));
        setUsers(transformedUsers);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false)
    }
  };

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleNewUserChange = (field, value) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddUser = async () => {
    if (newUser.firstName && newUser.email && newUser.role && newUser.password) {
      try {
        console.log('🔐 Creating new user in PostgreSQL...');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: newUser.firstName,
            email: newUser.email,
            role: newUser.role,
            password: newUser.password
          })
        });

        if (response.ok) {
          await fetchUsers(); // Refresh list
          const userEmail = newUser.email;
          const userPassword = newUser.password;
          setNewUser({ firstName: '', email: '', role: '', password: '' });
          showToast(`User created successfully! Login: ${userEmail}`, 'success');
          console.log('✅ User created in PostgreSQL');
        } else {
          const error = await response.json();
          showToast('Failed to create user: ' + error.error, 'error');
          console.error('❌ Create user error:', error);
        }
      } catch (error) {
        console.error('Error creating user:', error);
        showToast('Failed to create user. Please try again.', 'error');
      }
    } else {
      showToast('Please fill in all fields (Name, Email, Role, Password)', 'error');
    }
  }

  const handlePermissionChange = async (userId, permission, value) => {
    console.log(`🔄 Updating permission: ${permission} = ${value} for user ${userId}`);
    
    // Update UI immediately for responsiveness
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, permissions: { ...user.permissions, [permission]: value } }
        : user
    ))

    // Save to backend
    try {
      const user = users.find(u => u.id === userId);
      const updatedPermissions = { ...user.permissions, [permission]: value };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          permissions: JSON.stringify(updatedPermissions)
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Permission updated in PostgreSQL:', result);
        
        // Show success message
        const updatedUser = users.find(u => u.id === userId);
        showToast(`${permission.toUpperCase()} ${value ? 'enabled' : 'disabled'} for ${updatedUser?.name}`, 'success');
      } else {
        const error = await response.json();
        console.error('❌ Failed to update permission:', error);
        await fetchUsers(); // Revert on error
        showToast('Failed to update permissions: ' + (error.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      await fetchUsers(); // Revert
      showToast('Failed to update permissions. Please try again.', 'error');
    }
  }

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    
    // Prevent deleting admin users
    if (user?.role === 'ADMIN') {
      showToast('Cannot delete admin users! Admin accounts are protected.', 'error');
      return;
    }
    
    showConfirmDialog(
      'Delete User',
      `Are you sure you want to delete "${user?.name}" (${user?.email})?\n\nThis action cannot be undone.`,
      async () => {
        try {
          console.log('🗑️ Deleting user from PostgreSQL...');
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            await fetchUsers(); // Refresh list
            showToast(`User "${user?.name}" deleted successfully`, 'success');
            console.log('✅ User deleted from PostgreSQL');
            closeConfirmDialog();
          } else {
            const error = await response.json();
            showToast('Failed to delete user: ' + error.error, 'error');
            console.error('❌ Delete user error:', error);
            closeConfirmDialog();
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          showToast('Failed to delete user. Please try again.', 'error');
          closeConfirmDialog();
        }
      }
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      gap: 20,
      maxWidth: '100%',
      overflow: 'hidden',
      height: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Add New User Section */}
      <div style={{
        width: 320,
        minWidth: 300,
        maxWidth: '38%',
        background: colors.panel,
        borderRadius: 12,
        padding: 20,
        height: 'fit-content',
        flexShrink: 0
      }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.text,
          marginBottom: 10
        }}>
          Add New User
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* First Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: colors.text,
              marginBottom: 4
            }}>
              First Name
            </label>
            <input
              type="text"
              value={newUser.firstName}
              onChange={(e) => handleNewUserChange('firstName', e.target.value)}
              style={{
              width: '100%',
              height: '36px',
              padding: '8px 12px',
              borderRadius: 6,
              background: colors.bg,
              border: '1px solid #3D4142',
              color: colors.text,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = '#3D4142'}
            />
          </div>
          
          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: colors.text,
              marginBottom: 4
            }}>
              Email
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => handleNewUserChange('email', e.target.value)}
              style={{
              width: '100%',
              height: '36px',
              padding: '8px 12px',
              borderRadius: 6,
              background: colors.bg,
              border: '1px solid #3D4142',
              color: colors.text,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = '#3D4142'}
            />
          </div>
          
          {/* Role */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: colors.text,
              marginBottom: 4
            }}>
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => handleNewUserChange('role', e.target.value)}
              style={{
              width: '100%',
              height: '36px',
              padding: '8px 12px',
              borderRadius: 6,
              background: colors.bg,
              border: '1px solid #3D4142',
              color: colors.text,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = '#3D4142'}
            >
              <option value="">Select Role</option>
              <option value="STAFF">Staff</option>
              <option value="USER">User</option>
            </select>
          </div>
          
          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: colors.text,
              marginBottom: 4
            }}>
              Password
            </label>
            <div style={{ position: 'relative', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newUser.password}
                onChange={(e) => handleNewUserChange('password', e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '8px 12px',
                  paddingRight: '40px',
                  borderRadius: 6,
                  background: colors.bg,
                  border: '1px solid #3D4142',
                  color: colors.text,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = colors.accent}
                onBlur={(e) => e.target.style.borderColor = '#3D4142'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: colors.muted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20
            }}
              >
                <EyeIcon />
              </button>
            </div>
          </div>
          
          {/* Add Button */}
          <button
            onClick={handleAddUser}
            style={{
              width: '100%',
              background: colors.accent,
              border: 'none',
              color: '#333333',
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: 2
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.9'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Add
          </button>
        </div>
      </div>
      
      {/* User Access Management */}
      <div style={{ 
        flex: 1,
        minWidth: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          background: colors.panel,
          borderRadius: 16,
          padding: 24,
          maxWidth: '100%',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: `2px solid ${colors.accent}`
          }}>
            <span style={{ fontSize: 24 }}>👥</span>
            <h3 style={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.text,
              margin: 0,
              letterSpacing: '0.5px'
            }}>
              User Access Management
            </h3>
            <span style={{
              marginLeft: 'auto',
              background: colors.accent,
              color: '#000',
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 12
            }}>
              {users.length} {users.length === 1 ? 'User' : 'Users'}
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 20,
            flex: 1,
            overflow: 'auto',
            paddingRight: 8
          }}>
            {users.map(user => (
              <div key={user.id} style={{
                background: colors.bg,
                borderRadius: 12,
                padding: 20,
                border: `2px solid ${user.role === 'ADMIN' ? colors.accent : '#3D4142'}`,
                maxWidth: '100%',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: user.role === 'ADMIN' ? `0 4px 16px ${colors.accent}40` : '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}>
                {/* User Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: `1px solid ${colors.muted}40`
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 6
                    }}>
                      <h4 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: colors.text,
                        margin: 0
                      }}>
                        {user.name}
                      </h4>
                      <span style={{
                        background: user.role === 'ADMIN' ? colors.accent : user.role === 'STAFF' ? '#4CAF50' : '#2196F3',
                        color: user.role === 'ADMIN' ? '#000' : '#FFF',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {user.role}
                      </span>
                      {user.role === 'ADMIN' && (
                        <span style={{
                          fontSize: 16,
                          filter: 'grayscale(0)',
                          animation: 'pulse 2s infinite'
                        }}>👑</span>
                      )}
                    </div>
                    <p style={{
                      fontSize: 13,
                      color: colors.muted,
                      margin: 0,
                      fontFamily: 'monospace'
                    }}>
                      📧 {user.email}
                    </p>
                  </div>
                  
                  {/* Delete Button */}
                  {user.role !== 'ADMIN' && (
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      style={{
                        background: 'transparent',
                        border: `2px solid #F44336`,
                        color: '#F44336',
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s ease',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F44336';
                        e.currentTarget.style.color = '#FFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#F44336';
                      }}
                      title="Delete user"
                    >
                      <FiTrash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
                
                {/* Permissions Section */}
                <div style={{ 
                  marginTop: 16,
                  padding: 16,
                  background: '#0f1011',
                  borderRadius: 10,
                  border: `2px solid ${colors.accent}60`
                }}>
                  <h4 style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: colors.accent,
                    marginBottom: 16,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{ fontSize: 18 }}>🔐</span> Page Access Permissions
                  </h4>
                  
                  {/* Permissions Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 12,
                    maxWidth: '100%'
                  }}>
                    {Object.entries(user.permissions).map(([permission, enabled]) => (
                      <div key={permission} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: enabled ? `${colors.accent}20` : colors.bg,
                        borderRadius: 10,
                        border: enabled ? `2px solid ${colors.accent}` : '2px solid #2a2d2e',
                        minHeight: '56px',
                        transition: 'all 0.3s ease',
                        boxShadow: enabled ? `0 4px 12px ${colors.accent}25` : 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = enabled 
                          ? `0 6px 16px ${colors.accent}35` 
                          : '0 2px 8px rgba(0, 0, 0, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = enabled 
                          ? `0 4px 12px ${colors.accent}25` 
                          : 'none';
                      }}
                      >
                        <div style={{ flex: 1, marginRight: 12 }}>
                          <span style={{
                            fontSize: 14,
                            color: enabled ? colors.accent : colors.muted,
                            textTransform: 'capitalize',
                            fontWeight: enabled ? 700 : 500,
                            display: 'block',
                            letterSpacing: '0.3px'
                          }}>
                            {permission}
                          </span>
                          <span style={{
                            fontSize: 10,
                            color: enabled ? colors.accent + '90' : colors.muted,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {enabled ? '✓ Enabled' : '✗ Disabled'}
                          </span>
                        </div>
                        <ToggleSwitch
                          checked={enabled}
                          onChange={(value) => handlePermissionChange(user.id, permission, value)}
                          disabled={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
        onClick={closeConfirmDialog}
        >
          <div 
            style={{
              background: colors.panel,
              borderRadius: '16px',
              padding: '28px',
              width: '460px',
              maxWidth: '90%',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
              border: `2px solid ${colors.accent}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '22px',
              fontWeight: '700',
              color: colors.text,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ fontSize: 24 }}>⚠️</span>
              {confirmDialog.title}
            </h3>

            <p style={{
              margin: '0 0 28px 0',
              fontSize: '15px',
              color: colors.muted,
              lineHeight: '1.6',
              whiteSpace: 'pre-line'
            }}>
              {confirmDialog.message}
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeConfirmDialog}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: `2px solid ${colors.muted}`,
                  borderRadius: '10px',
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.muted + '40';
                  e.currentTarget.style.borderColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = colors.muted;
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.onConfirm) {
                    confirmDialog.onConfirm();
                  }
                }}
                style={{
                  padding: '12px 24px',
                  background: '#DC3545',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#C82333';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.6)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#DC3545';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </div>
  )
}
