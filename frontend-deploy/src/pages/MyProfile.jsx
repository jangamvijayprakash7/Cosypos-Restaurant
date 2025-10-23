import { useState, useEffect } from 'react'
import { FiEdit3 } from 'react-icons/fi'
import { updateProfile, uploadProfileImage } from '../utils/api'
import { useUser } from './UserContext'

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

function EyeOffIcon({ color = colors.muted }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function MyProfile() {
  const { user, updateUser } = useUser()
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    address: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.name || '',
        email: user.email || '',
        address: user.phone || '', // Using phone field as address for now
        newPassword: '',
        confirmPassword: ''
      })
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage('')
      
      // Validate passwords if provided
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage('Passwords do not match')
        return
      }
      
      // Prepare update data
      const updateData = {
        name: formData.firstName,
        email: formData.email,
        phone: formData.address
      }
      
      const response = await updateProfile(updateData)
      updateUser(response.user)
      setMessage('Profile updated successfully!')
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }))
      
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    if (user) {
      setFormData({
        firstName: user.name || '',
        email: user.email || '',
        address: user.phone || '',
        newPassword: '',
        confirmPassword: ''
      })
    }
    setMessage('')
  }

  const handleImageUpload = async (file) => {
    try {
      setUploading(true)
      setMessage('')
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size must be less than 5MB')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file')
        return
      }
      
      const response = await uploadProfileImage(file)
      updateUser(response.user)
      setMessage('Profile image updated successfully!')
      
    } catch (error) {
      console.error('Image upload failed:', error)
      setMessage(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div style={{
        background: colors.panel,
        borderRadius: 12,
        padding: 20,
        color: colors.text,
        maxWidth: '100%',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: 16, color: colors.muted }}>Loading profile...</div>
      </div>
    )
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{
        background: colors.panel,
        borderRadius: 12,
        padding: 20,
        color: colors.text,
        maxWidth: '100%',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
      <h2 style={{
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 12,
        color: colors.text
      }}>
        Personal Information
      </h2>
      
      {/* Message Display */}
      {message && (
        <div style={{
          padding: '8px 12px',
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 14,
          backgroundColor: message.includes('successfully') ? '#4CAF50' : '#FF4444',
          color: '#FFFFFF'
        }}>
          {message}
        </div>
      )}
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 12
      }}>
        {/* Profile Picture */}
        <div 
          onClick={() => {
            // Create file input for image upload
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
              const file = e.target.files[0];
              if (file) {
                await handleImageUpload(file);
              }
            };
            input.click();
          }}
          style={{ 
            position: 'relative', 
            marginBottom: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          {/* Main Profile Circle */}
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: '#FAC1D9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden'
          }}>
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
          
          {/* Edit Icon */}
          <div style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: uploading ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            zIndex: 3,
            opacity: uploading ? 0.7 : 1
          }}>
            {uploading ? (
              <div style={{
                width: 12,
                height: 12,
                border: '2px solid #FFFFFF',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <FiEdit3 size={14} color="#FFFFFF" />
            )}
          </div>
        </div>
        
        {/* Name and Role */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{
            fontSize: 14,
            fontWeight: 600,
            margin: '0 0 2px 0',
            color: colors.text
          }}>
            {user?.name || 'Loading...'}
          </h3>
          <p style={{
            fontSize: 11,
            color: colors.muted,
            margin: 0
          }}>
            {user?.role || 'Loading...'}
          </p>
        </div>
      </div>
      
      {/* Form Fields */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 10,
        flex: 1,
        overflow: 'hidden'
      }}>
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
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
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
            fontSize: 14,
            fontWeight: 500,
            color: colors.text,
            marginBottom: 8
          }}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
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
        
        {/* Address */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 500,
            color: colors.text,
            marginBottom: 8
          }}>
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
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
        
        {/* New Password */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 500,
            color: colors.text,
            marginBottom: 8
          }}>
            New Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Enter new password"
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingRight: '40px',
                borderRadius: 8,
                background: colors.bg,
                border: '1px solid #3D4142',
                color: colors.text,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = '#3D4142'}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
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
              justifyContent: 'center'
            }}
            >
              {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        
        {/* Confirm Password */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 500,
            color: colors.text,
            marginBottom: 8
          }}>
            Confirm Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingRight: '40px',
                borderRadius: 8,
                background: colors.bg,
                border: '1px solid #3D4142',
                color: colors.text,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = '#3D4142'}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              justifyContent: 'center'
            }}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px solid #3D4142',
        flexShrink: 0
      }}>
        <button
          onClick={handleDiscard}
          style={{
            background: 'none',
            border: 'none',
            color: colors.muted,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Discard Changes
        </button>
        
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? colors.muted : colors.accent,
            border: 'none',
            color: '#333333',
            fontSize: 12,
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 4,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: saving ? 0.6 : 1
          }}
          onMouseOver={(e) => !saving && (e.target.style.opacity = '0.9')}
          onMouseOut={(e) => !saving && (e.target.style.opacity = '1')}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
    </>
  )
}
