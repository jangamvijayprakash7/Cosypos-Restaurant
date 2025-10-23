import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Bell } from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import HeaderBar from './HeaderBar.jsx'
import AddEditPanel from './AddEditPanel.jsx'
import { useUser } from './UserContext.jsx'

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  text: '#FFFFFF',
  accent: '#FAC1D9',
  muted: '#777979',
  line: '#3D4142',
}

export default function StaffDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [profileImage, setProfileImage] = useState('/client img.png')
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Mock staff data - in real app, this would come from API
  const staffData = {
    id: '#101',
    name: 'Watson Joyce',
    email: 'watsonjoycell2@gmail.com',
    phone: '+1 (123) 123 4654',
    role: 'Manager',
    salary: '$2200.00',
    startTiming: '9am',
    endTiming: '6pm',
    address: 'House # 114 Street 123 USA, Chicago',
    dateOfBirth: '01-Jan-1983',
    profileImage: '/client img.png'
  }

  const handleEditProfile = () => {
    setShowEditModal(true)
  }

  const handleCloseEditModal = (updatedData) => {
    if (updatedData) {
      // In real app, this would update the staff data
      console.log('Staff updated:', updatedData)
    }
    setShowEditModal(false)
  }

  const handleDeleteProfile = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    console.log('Delete confirmed for staff:', staffData.name)
    // In real app, this would call API to delete staff
    navigate('/staff') // Navigate back to staff list
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowDeleteConfirm(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setProfileImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, overflowX: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative' }}>
        <Sidebar />
        
        {/* Custom Header */}
        <div className="page-main-content" style={{ 
          marginLeft: 0,
          paddingLeft: 20,
          paddingRight: 12, 
          paddingTop: 40, 
          paddingBottom: 20,
          display: 'flex', 
          alignItems: 'center', 
          gap: 16,
          background: '#111315',
          borderBottom: '1px solid #3D4142'
        }}>
          <button 
            onClick={() => navigate(-1)}
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
          <div style={{ fontSize: 25, fontWeight: 500, color: colors.text }}>{staffData.name}</div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification Bell Container */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{ 
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Bell size={20} color="#FFFFFF" />
                
                {/* Notification Badge */}
                <div style={{ 
                  position: 'absolute',
                  width: 10.4,
                  height: 10.4,
                  top: -2,
                  right: -2,
                  background: colors.accent,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 400,
                    fontSize: 5.94335,
                    lineHeight: '9px',
                    color: '#333333',
                    textAlign: 'center'
                  }}>
                    01
                  </span>
                </div>
              </div>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  background: colors.panel,
                  borderRadius: 8,
                  border: `1px solid ${colors.accent}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  zIndex: 1000,
                  minWidth: 200,
                  maxWidth: 300
                }}>
                  <div style={{ padding: 16 }}>
                    <div style={{ 
                      textAlign: 'center', 
                      color: colors.muted, 
                      fontSize: 14,
                      marginBottom: 12 
                    }}>
                      No notifications
                    </div>
                    <button 
                      onClick={() => setIsNotificationOpen(false)}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        background: colors.accent,
                        color: '#333333',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
                      onMouseLeave={(e) => e.target.style.background = colors.accent}
                    >
                      Show All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Separator Line */}
            <div style={{ 
              width: 0,
              height: 22.29,
              border: '0.742918px solid #FFFFFF',
              margin: '0 8px'
            }} />

            {/* User Profile */}
            <div 
              onClick={() => navigate('/profile')}
              style={{ 
                width: 37.15,
                height: 37.15,
                borderRadius: '50%',
                border: '1.48584px solid #FAC1D9',
                background: '#D9D9D9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.borderColor = '#FFB6C1'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.borderColor = '#FAC1D9'
              }}
            >
              <img 
                src="/profile img icon.jpg" 
                alt="Profile" 
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
              />
            </div>
          </div>
        </div>
        
        <main className="page-main-content" style={{ paddingTop: 20, paddingBottom: 32 }}>
          <div className="grid-1-col-mobile-2-desktop" style={{ gap: 16 }}>
            
            {/* Left Column - Profile Image */}
            <div style={{ 
              background: colors.panel, 
              borderRadius: 10, 
              padding: 24,
              height: 'fit-content'
            }}>
              <h3 style={{ 
                fontSize: 18, 
                fontWeight: 600, 
                marginBottom: 20, 
                color: colors.text 
              }}>
                Profile Image
              </h3>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%', 
                  overflow: 'hidden',
                  border: `2px solid ${colors.accent}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={profileImage} 
                    alt={staffData.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                  />
                </div>
                
                <label style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: colors.muted, 
                  fontSize: 14, 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}>
                  Change Profile Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
                
                {/* Edit and Delete buttons - Only for ADMIN users */}
                {user?.role === 'ADMIN' && (
                  <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                    <button 
                      onClick={handleEditProfile}
                      style={{ 
                        flex: 1,
                        padding: '10px 16px', 
                        borderRadius: 6, 
                        background: colors.accent, 
                        border: 'none', 
                        color: '#333', 
                        fontSize: 14, 
                        fontWeight: 500, 
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
                      onMouseLeave={(e) => e.target.style.background = colors.accent}
                    >
                      Edit profile
                    </button>
                    <button 
                      onClick={handleDeleteProfile}
                      style={{ 
                        flex: 1,
                        padding: '10px 16px', 
                        borderRadius: 6, 
                        background: 'transparent', 
                        border: `1px solid ${colors.accent}`, 
                        color: colors.accent, 
                        fontSize: 14, 
                        fontWeight: 500, 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = colors.accent
                        e.target.style.color = '#333'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = colors.accent
                      }}
                    >
                      Delete profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Employee Personal Details */}
              <div style={{ 
                background: colors.panel, 
                borderRadius: 10, 
                padding: 24
              }}>
                <h3 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  marginBottom: 20, 
                  color: colors.text 
                }}>
                  Employee Personal Details
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <div style={{ 
                      marginBottom: 8, 
                      fontSize: 14, 
                      color: colors.muted 
                    }}>
                      Full Name:
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 500, 
                      color: colors.text 
                    }}>
                      {staffData.name}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      marginBottom: 8, 
                      fontSize: 14, 
                      color: colors.muted 
                    }}>
                      Email:
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 500, 
                      color: colors.text 
                    }}>
                      {staffData.email}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      marginBottom: 8, 
                      fontSize: 14, 
                      color: colors.muted 
                    }}>
                      Phone number:
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 500, 
                      color: colors.text 
                    }}>
                      {staffData.phone}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      marginBottom: 8, 
                      fontSize: 14, 
                      color: colors.muted 
                    }}>
                      Date of birth:
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 500, 
                      color: colors.text 
                    }}>
                      {staffData.dateOfBirth}
                    </div>
                  </div>
                  
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ 
                      marginBottom: 8, 
                      fontSize: 14, 
                      color: colors.muted 
                    }}>
                      Address:
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 500, 
                      color: colors.text 
                    }}>
                      {staffData.address}
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Job Details */}
              <div style={{ 
                background: colors.panel, 
                borderRadius: 10, 
                padding: 24
              }}>
                <h3 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  marginBottom: 20, 
                  color: colors.text 
                }}>
                  Employee Job Details
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <div style={{ 
                      marginBottom: 8, 
                      fontSize: 14, 
                      color: colors.muted 
                    }}>
                      Role:
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 500, 
                      color: colors.text 
                    }}>
                      {staffData.role}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      marginBottom: 8, 
                      fontSize: 14, 
                      color: colors.muted 
                    }}>
                      Salary:
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 500, 
                      color: colors.text 
                    }}>
                      {staffData.salary}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      marginBottom: 8, 
                      fontSize: 14, 
                      color: colors.muted 
                    }}>
                      Shift start timing:
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 500, 
                      color: colors.text 
                    }}>
                      {staffData.startTiming}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      marginBottom: 8, 
                      fontSize: 14, 
                      color: colors.muted 
                    }}>
                      Shift end timing:
                    </div>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 500, 
                      color: colors.text 
                    }}>
                      {staffData.endTiming}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div 
            onClick={handleBackdropClick}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                background: colors.panel,
                borderRadius: 12,
                padding: 24,
                maxWidth: 400,
                width: '90%',
                color: colors.text
              }}
            >
              <h3 style={{ 
                fontSize: 18, 
                fontWeight: 600, 
                marginBottom: 16, 
                color: colors.text 
              }}>
                Delete Staff Member
              </h3>
              <p style={{ 
                marginBottom: 24, 
                color: colors.muted,
                lineHeight: 1.5
              }}>
                Are you sure you want to delete {staffData.name}? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 6,
                    background: colors.inputBg,
                    border: 'none',
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#3D4142'}
                  onMouseLeave={(e) => e.target.style.background = colors.inputBg}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 6,
                    background: '#ff4444',
                    border: 'none',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#ff3333'}
                  onMouseLeave={(e) => e.target.style.background = '#ff4444'}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Modal */}
        <AddEditPanel 
          open={showEditModal} 
          onClose={handleCloseEditModal} 
          initial={staffData} 
        />
      </div>
    </div>
  )
}


