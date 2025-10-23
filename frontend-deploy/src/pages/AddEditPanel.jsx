import React, { useState, useEffect } from 'react'
import api from '../utils/apiClient'

const colors = {
  panel: '#292C2D',
  text: '#FFFFFF',
  inputBg: '#3D4142',
  accent: '#FAC1D9',
  muted: '#777979',
  line: '#3D4142',
}

function AddEditPanel({ open, onClose, initial }) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [startTiming, setStartTiming] = useState('');
  const [endTiming, setEndTiming] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when initial data changes
  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setEmail(initial.email || '');
      setPhone(initial.phone?.replace('N/A', '') || '');
      setRole(initial.role || '');
      // Parse salary from "$X.XX" format
      const salaryValue = initial.salary?.replace(/[\$,]/g, '').replace('N/A', '') || '';
      setSalary(salaryValue);
      
      // Parse timings from "Xam to Ypm" format
      const timings = initial.timings?.replace('N/A', '') || '';
      if (timings && timings.includes(' to ')) {
        const [start, end] = timings.split(' to ');
        setStartTiming(start.trim());
        setEndTiming(end.trim());
      } else {
        setStartTiming('');
        setEndTiming('');
      }
      
      // Calculate date of birth from age
      if (initial.age && initial.age !== 'N/A') {
        const ageNum = parseInt(initial.age);
        if (!isNaN(ageNum)) {
          const birthYear = new Date().getFullYear() - ageNum;
          setDateOfBirth(`${birthYear}-01-01`);
        }
      } else {
        setDateOfBirth('');
      }
      
      setImagePreview(initial.profileImage || null);
    } else {
      // Reset all fields for new entry
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('');
      setSalary('');
      setStartTiming('');
      setEndTiming('');
      setAddress('');
      setDateOfBirth('');
      setAdditionalDetails('');
      setImagePreview(null);
    }
    setError(null);
  }, [initial]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Prevent body scrolling when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!name || !email) {
        throw new Error('Name and email are required');
      }

      if (!isEdit && !password) {
        throw new Error('Password is required for new staff members');
      }

      // Prepare staff data
      const timings = (startTiming && endTiming) ? `${startTiming} to ${endTiming}` : null;
      const age = calculateAge(dateOfBirth);

      const staffData = {
        name,
        email,
        phone: phone || null,
        role: role || 'STAFF',
        salary: salary ? parseFloat(salary) : null,
        timings,
        age
      };

      // Add password only for new staff or if changed
      if (!isEdit) {
        staffData.password = password;
      } else if (password && password.trim().length > 0) {
        staffData.password = password;
      }
      let savedStaff;
      if (isEdit) {
        // Update existing staff - use dbId instead of display id
        savedStaff = await api.put(`/api/users/${initial.dbId || initial.id}`, staffData);
      } else {
        // Create new staff
        savedStaff = await api.post('/api/users', staffData);
      }

      // Handle image upload if there's a new image
      if (profileImage && savedStaff.id) {
        console.log('Attempting to upload profile image:', profileImage);
        console.log('For user ID:', savedStaff.id);
        
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        formData.append('userId', savedStaff.id);
        
        console.log('FormData entries:');
        for (let pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }
        
        try {
          const imageResponse = await api.upload(`/api/profile-image?userId=${savedStaff.id}`, formData);
          console.log('Image upload response:', imageResponse);
          
          // Update the saved staff data with the new profile image
          if (imageResponse.profileImage) {
            savedStaff.profileImage = imageResponse.profileImage;
          }
        } catch (imageError) {
          console.error('Error uploading profile image:', imageError);
          // Continue anyway, the staff was saved
        }
      }

      // Close panel and trigger refresh
      onClose(savedStaff);
    } catch (err) {
      console.error('Error saving staff:', err);
      setError(err.message || 'Failed to save staff member');
      setLoading(false);
    }
  };

  if (!open) return null;
  
  return (
    <div onClick={() => onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000, overflow: 'hidden', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 640, height: '100vh', background: colors.panel, borderRadius: '30px 0 0 30px', padding: 40, color: colors.text, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button 
              onClick={() => onClose()} 
              style={{ 
                background: colors.inputBg, 
                border: 'none', 
                borderRadius: '50%', 
                width: 36, 
                height: 36, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: colors.text, 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: 16,
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#3D4142'
                e.target.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = colors.inputBg
                e.target.style.transform = 'scale(1)'
              }}
            >
              &lt;
            </button>
            <div style={{ fontSize: 25, fontWeight: 500 }}>{isEdit ? 'Edit Staff' : 'Add Staff'}</div>
          </div>
          <button 
            onClick={() => onClose()} 
            style={{ 
              background: colors.inputBg, 
              border: 'none', 
              borderRadius: '50%', 
              width: 36, 
              height: 36, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: colors.text, 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: 16,
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#3D4142'
              e.target.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = colors.inputBg
              e.target.style.transform = 'scale(1)'
            }}
          >
            ✕
          </button>
        </div>
        
        {/* Profile Picture Upload */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            background: colors.inputBg, 
            borderRadius: 10, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Profile preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : isEdit ? (
              <img 
                src="/client img.png" 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ fontSize: 30, color: colors.muted }}>🏔️</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ 
                position: 'absolute', 
                inset: 0, 
                opacity: 0, 
                cursor: 'pointer' 
              }}
            />
          </div>
          <button 
            type="button"
            onClick={() => document.querySelector('input[type="file"]').click()}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: colors.muted, 
              fontSize: 14, 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Change Profile Picture
          </button>
        </div>

        {error && (
          <div style={{ 
            background: '#E70000', 
            color: '#fff', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 15,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, flex: 1 }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>Full Name</div>
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter full name" 
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, fontSize: 14, minHeight: 40, boxSizing: 'border-box' }} 
                />
              </div>
              
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>Email</div>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter email address" 
                  required
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, fontSize: 14, minHeight: 40, boxSizing: 'border-box' }} 
                />
              </div>
              
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>
                  Password {isEdit && <span style={{ fontSize: 12, color: colors.muted }}>(leave empty to keep current)</span>}
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={isEdit ? "Enter new password (optional)" : "Enter password"}
                  required={!isEdit}
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, fontSize: 14, minHeight: 40, boxSizing: 'border-box' }} 
                />
              </div>
              
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>Role</div>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, fontSize: 14, minHeight: 40, boxSizing: 'border-box' }}
                >
                  <option value="">Select role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                  <option value="USER">User</option>
                </select>
              </div>
              
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>Phone number</div>
                <input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Enter phone number" 
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, fontSize: 14, minHeight: 40, boxSizing: 'border-box' }} 
                />
              </div>
              
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>Salary</div>
                <input 
                  value={salary} 
                  onChange={(e) => setSalary(e.target.value)} 
                  placeholder="Enter Salary" 
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, fontSize: 14, minHeight: 40, boxSizing: 'border-box' }} 
                />
              </div>
              
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>Date of birth</div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="date"
                    value={dateOfBirth} 
                    onChange={(e) => setDateOfBirth(e.target.value)} 
                    placeholder="Enter date of birth" 
                    style={{ width: '100%', padding: 12, paddingRight: 35, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, fontSize: 14, minHeight: 40, boxSizing: 'border-box' }} 
                  />
                  <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: colors.muted, fontSize: 12 }}>📅</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>Shift start timing</div>
                <div style={{ position: 'relative' }}>
                  <input 
                    value={startTiming} 
                    onChange={(e) => setStartTiming(e.target.value)} 
                    placeholder="Enter start timing" 
                    style={{ width: '100%', padding: 12, paddingRight: 35, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, fontSize: 14, minHeight: 40, boxSizing: 'border-box' }} 
                  />
                  <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: colors.muted, fontSize: 12 }}>🕐</div>
                </div>
              </div>
              
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>Shift end timing</div>
                <div style={{ position: 'relative' }}>
                  <input 
                    value={endTiming} 
                    onChange={(e) => setEndTiming(e.target.value)} 
                    placeholder="Enter end timing" 
                    style={{ width: '100%', padding: 12, paddingRight: 35, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, fontSize: 14, minHeight: 40, boxSizing: 'border-box' }} 
                  />
                  <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: colors.muted, fontSize: 12 }}>🕐</div>
                </div>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>Address</div>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Enter address" 
                  rows={2}
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, resize: 'none', fontSize: 14, minHeight: 60, boxSizing: 'border-box' }} 
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ marginBottom: 4, fontWeight: 500, color: colors.text, fontSize: 14 }}>Additional details</div>
                <textarea 
                  value={additionalDetails} 
                  onChange={(e) => setAdditionalDetails(e.target.value)} 
                  placeholder="Enter additional details" 
                  rows={2}
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: colors.inputBg, color: colors.text, resize: 'none', fontSize: 14, minHeight: 60, boxSizing: 'border-box' }} 
                />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 15, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${colors.line}` }}>
            <button 
              type="button" 
              onClick={() => onClose()} 
              style={{ 
                padding: '10px 20px', 
                borderRadius: 6, 
                background: colors.inputBg, 
                border: 'none', 
                color: colors.text, 
                fontSize: 14, 
                fontWeight: 500, 
                cursor: 'pointer' 
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                borderRadius: 6, 
                background: loading ? colors.muted : colors.accent, 
                border: 'none', 
                color: loading ? '#999' : '#333', 
                fontSize: 14, 
                fontWeight: 600, 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditPanel
