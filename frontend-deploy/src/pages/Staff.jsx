import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { Bell } from 'lucide-react';
import { useUser } from './UserContext';
import Sidebar from './Sidebar.jsx';
import HeaderBar from './HeaderBar.jsx';
import AddEditPanel from './AddEditPanel.jsx';
import Toast from '../components/Toast.jsx';
import api from '../utils/apiClient';

const colors = {
  bg: '#111315',
  panel: '#292C2D',
  accent: '#FAC1D9',
  text: '#FFFFFF',
  muted: '#777979',
  line: '#3D4142',
  inputBg: '#3D4142',
  inputBorder: '#5E5E5E',
};

function Header({ onAdd, count, activeTab, setActiveTab, sortBy, sortOrder, onSort, user }) {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  return (
    <>
      <HeaderBar title="Staff Management" showBackButton={true} right={(
        <>
          {/* Notification Bell Container */}
          <div 
            onClick={() => navigate('/notifications')}
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
            {/* Bell Icon */}
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
              src={user?.profileImage ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${user.profileImage}` : "/profile img icon.jpg"} 
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

        </>
      )} />
      <div className="page-main-content" style={{ marginTop: 30, paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ 
          maxWidth: '1100px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 20px'
        }}>
          <div style={{ fontSize: 25, fontWeight: 500 }}>Staff ({count})</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Only show Add Staff button for ADMIN users */}
          {user?.role === 'ADMIN' && (
            <button onClick={onAdd} style={{ background: colors.accent, color: '#333', border: 'none', padding: '14px 22px', borderRadius: 7, fontWeight: 500, cursor: 'pointer' }}>Add Staff</button>
          )}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              style={{ 
                background: '#3D4142', 
                color: '#fff', 
                border: 'none', 
                padding: '13px 20px', 
                borderRadius: 10, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#4A4F50'}
              onMouseLeave={(e) => e.target.style.background = '#3D4142'}
            >
              <span style={{ fontWeight: 300 }}>Sort by {sortBy}</span>
              <span style={{ 
                width: 17, 
                height: 17, 
                border: '1.5px solid #fff', 
                borderTop: 'none', 
                borderLeft: 'none', 
                transform: sortOrder === 'asc' ? 'rotate(45deg)' : 'rotate(225deg)',
                transition: 'transform 0.2s ease'
              }} />
            </button>
            
            {/* Sort Dropdown */}
            {isSortOpen && (
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
                <div style={{ padding: 8 }}>
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'role', label: 'Role' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'age', label: 'Age' },
                    { key: 'salary', label: 'Salary' },
                    { key: 'timings', label: 'Timings' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        onSort(option.key);
                        setIsSortOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: sortBy === option.key ? colors.accent : 'transparent',
                        color: sortBy === option.key ? '#333' : colors.text,
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 14,
                        fontWeight: sortBy === option.key ? 500 : 400,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => {
                        if (sortBy !== option.key) {
                          e.target.style.background = '#3D4142'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== option.key) {
                          e.target.style.background = 'transparent'
                        }
                      }}
                    >
                      {option.label}
                      {sortBy === option.key && (
                        <span style={{ fontSize: 12 }}>
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      <div className="page-main-content" style={{ marginTop: 16, paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ 
          maxWidth: '1100px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 35,
          padding: '0 20px'
        }}>
          <button 
            onClick={() => setActiveTab('management')} 
            style={{ 
              background: activeTab === 'management' ? colors.accent : 'transparent', 
              color: activeTab === 'management' ? '#333' : '#fff', 
              border: 'none', 
              fontWeight: 500,
              padding: '14px 22px',
              borderRadius: 7,
              cursor: 'pointer'
            }}
          >
            Staff Management
          </button>
          {/* Only show Attendance tab for ADMIN users */}
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => setActiveTab('attendance')} 
              style={{ 
                background: activeTab === 'attendance' ? colors.accent : 'transparent', 
                color: activeTab === 'attendance' ? '#333' : '#fff', 
                border: 'none', 
                fontWeight: 500,
                padding: '14px 22px',
                borderRadius: 7,
                cursor: 'pointer'
              }}
            >
              Attendance
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function TableHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '13px 25px', borderBottom: `1px solid ${colors.line}`, background: colors.panel, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
      <div style={{ width: 20 }}><div style={{ width: 11, height: 11, border: '1px solid #fff' }} /></div>
      <div style={{ width: 60, fontWeight: 500, fontSize: 14 }}>ID</div>
      <div style={{ width: 260, fontWeight: 500, fontSize: 14 }}>Name</div>
      <div style={{ width: 260, fontWeight: 500, fontSize: 14 }}>Email</div>
      <div style={{ width: 180, fontWeight: 500, fontSize: 14 }}>Phone</div>
      <div style={{ width: 80, fontWeight: 500, fontSize: 14, textAlign: 'right' }}>Age</div>
      <div style={{ width: 120, fontWeight: 500, fontSize: 14, textAlign: 'right' }}>Salary</div>
      <div style={{ width: 140, fontWeight: 500, fontSize: 14, textAlign: 'right' }}>Timings</div>
      <div style={{ marginLeft: 'auto', width: 100, fontWeight: 500, fontSize: 14, textAlign: 'right' }}>Actions</div>
    </div>
  );
}

function AttendanceTableHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '13px 25px', borderBottom: `1px solid ${colors.line}`, background: colors.panel, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
      <div style={{ width: 20 }}><div style={{ width: 11, height: 11, border: '1px solid #fff' }} /></div>
      <div style={{ width: 60, fontWeight: 500, fontSize: 14 }}>ID</div>
      <div style={{ width: 200, fontWeight: 500, fontSize: 14 }}>Name</div>
      <div style={{ width: 120, fontWeight: 500, fontSize: 14 }}>Date</div>
      <div style={{ width: 140, fontWeight: 500, fontSize: 14 }}>Timings</div>
      <div style={{ marginLeft: 'auto', width: 200, fontWeight: 500, fontSize: 14, textAlign: 'right' }}>Status</div>
    </div>
  );
}

function StaffRow({ staff, onEdit, onDelete, zebra, user, attendanceStatus, onStatusChange }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const statusOptions = [
    { key: 'present', label: 'Present', color: '#4CAF50', bgColor: '#E8F5E9' },
    { key: 'absent', label: 'Absent', color: '#F44336', bgColor: '#FFEBEE' },
    { key: 'half', label: 'Half Shift', color: '#FF9800', bgColor: '#FFF3E0' },
    { key: 'leave', label: 'Leave', color: '#2196F3', bgColor: '#E3F2FD' }
  ];

  const currentStatus = statusOptions.find(s => s.key === attendanceStatus);
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        width: '100%',
        minHeight: 70, 
        background: isHovered ? '#3D4142' : colors.panel, 
        display: 'flex', 
        alignItems: 'center', 
        padding: '12px 20px',
        marginBottom: 0,
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        boxSizing: 'border-box'
      }}>
      {/* Checkbox */}
      <div style={{ 
        width: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        flexShrink: 0
      }}>
        <div style={{ 
          width: 14,
          height: 14,
          border: '1px solid #FFFFFF',
          borderRadius: 2
        }} />
      </div>
      
      {/* ID */}
      <div style={{ 
        width: 45,
        fontFamily: 'Poppins',
        fontWeight: 400,
        fontSize: 14,
        color: '#FFFFFF',
        marginRight: 15,
        flexShrink: 0
      }}>
        {staff.id}
      </div>
      
      {/* Name and Role with Profile Picture */}
      <div style={{ 
        width: 180,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginRight: 15,
        flexShrink: 0
      }}>
        {/* Profile Picture */}
        <div style={{ 
          width: 35,
          height: 35,
          borderRadius: '50%',
          border: '1px solid #FAC1D9',
          background: '#111827',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={staff.profileImage ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${staff.profileImage}` : "/client img.png"}
            alt={staff.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%'
            }}
            onError={(e) => {
              e.target.src = "/client img.png";
            }}
          />
        </div>
        
        {/* Name and Role */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          flex: 1,
          minWidth: 0
        }}>
          <div style={{ 
            fontFamily: 'Poppins',
            fontWeight: 500,
            fontSize: 13,
            color: '#FFFFFF',
            marginBottom: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%'
          }}>
            {staff.name}
          </div>
          <div style={{ 
            fontFamily: 'Poppins',
            fontWeight: 400,
            fontSize: 11,
            color: '#FAC1D9'
          }}>
            {staff.role}
          </div>
        </div>
      </div>
      
      {/* Email */}
      <div style={{ 
        width: 160,
        fontFamily: 'Poppins',
        fontWeight: 400,
        fontSize: 13,
        color: '#FFFFFF',
        marginRight: 15,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {staff.email}
      </div>
      
      {/* Phone */}
      <div style={{ 
        width: 110,
        fontFamily: 'Poppins',
        fontWeight: 400,
        fontSize: 13,
        color: staff.phone ? '#FFFFFF' : '#777979',
        marginRight: 15,
        flexShrink: 0
      }}>
        {staff.phone || '-'}
      </div>
      
      {/* Age */}
      <div style={{ 
        width: 50,
        fontFamily: 'Poppins',
        fontWeight: 400,
        fontSize: 13,
        color: staff.age ? '#FFFFFF' : '#777979',
        textAlign: 'center',
        marginRight: 15,
        flexShrink: 0
      }}>
        {staff.age || '-'}
      </div>
      
      {/* Salary */}
      <div style={{ 
        width: 75,
        fontFamily: 'Poppins',
        fontWeight: 400,
        fontSize: 13,
        color: staff.salary ? '#FFFFFF' : '#777979',
        textAlign: 'right',
        marginRight: 15,
        flexShrink: 0
      }}>
        {staff.salary || '-'}
      </div>
      
      {/* Timings */}
      <div style={{ 
        width: 85,
        fontFamily: 'Poppins',
        fontWeight: 400,
        fontSize: 13,
        color: staff.timings ? '#FFFFFF' : '#777979',
        textAlign: 'center',
        marginRight: 15,
        flexShrink: 0
      }}>
        {staff.timings || '-'}
      </div>
      
      {/* Attendance Status */}
      <div onClick={(e) => e.stopPropagation()} style={{ 
        position: 'relative',
        marginRight: 20,
        flexShrink: 0,
        minWidth: 120
      }}>
        {currentStatus ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              style={{
                padding: '8px 14px',
                background: currentStatus.bgColor,
                color: currentStatus.color,
                border: `1px solid ${currentStatus.color}`,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = `0 2px 8px ${currentStatus.color}40`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {currentStatus.label}
            </button>
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.muted,
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = colors.text}
              onMouseLeave={(e) => e.target.style.color = colors.muted}
            >
              <FiEdit3 size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            style={{
              padding: '8px 14px',
              background: colors.inputBg,
              color: colors.muted,
              border: `1px solid ${colors.line}`,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#4A4F50';
              e.target.style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = colors.inputBg;
              e.target.style.color = colors.muted;
            }}
          >
            Mark Status
          </button>
        )}

        {/* Status Dropdown Menu */}
        {showStatusMenu && (
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
            minWidth: 140,
            overflow: 'hidden'
          }}>
            {statusOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  onStatusChange(staff.dbId || staff.id, option.key);
                  setShowStatusMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  color: option.color,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = option.bgColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: option.color
                }} />
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div onClick={(e) => e.stopPropagation()} style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 18,
        marginLeft: 'auto'
      }}>
        {/* View Button - Eye Icon - Available for all users */}
        <button 
          onClick={() => navigate(`/staff/${encodeURIComponent(staff.dbId || staff.id)}`)} 
          style={{ 
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
            padding: 0,
          transition: 'transform 0.2s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <FiEye size={20} color="#FAC1D9" />
        </button>
        
        {/* Edit and Delete Buttons - Only for ADMIN users */}
        {user?.role === 'ADMIN' && (
          <>
            {/* Edit Button - Pencil Icon */}
            <button 
              onClick={() => onEdit(staff)} 
              style={{ 
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
                padding: 0,
              transition: 'transform 0.2s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <FiEdit3 size={18} color="#FFFFFF" />
            </button>
            
            {/* Delete Button - Trash Can Icon */}
            <button 
              onClick={() => onDelete(staff)} 
              style={{ 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <FiTrash2 size={18} color="#E70000" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AttendanceRow({ staff, attendanceStatus, onStatusChange, user }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const statusButtons = [
    { key: 'present', label: 'Present', color: '#FAC1D9', textColor: '#333' },
    { key: 'absent', label: 'Absent', color: '#FFD700', textColor: '#333' },
    { key: 'half', label: 'Half Shift', color: '#87CEEB', textColor: '#333' },
    { key: 'leave', label: 'Leave', color: '#FF6B6B', textColor: '#fff' }
  ];
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        width: '100%',
        minHeight: 70, 
        background: isHovered ? '#3D4142' : colors.panel, 
        display: 'flex', 
        alignItems: 'center', 
        padding: '12px 20px',
        marginBottom: 0,
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        boxSizing: 'border-box'
      }}>
      {/* Checkbox */}
      <div style={{ 
        width: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20
      }}>
        <div style={{ 
          width: 16,
          height: 16,
          border: '1px solid #FFFFFF',
          borderRadius: 2
        }} />
      </div>
      
      {/* ID */}
      <div style={{ 
        width: 60,
        fontFamily: 'Poppins',
        fontWeight: 400,
        fontSize: 14,
        color: '#FFFFFF',
        marginRight: 30
      }}>
        {staff.id}
      </div>
      
      {/* Name and Role with Profile Picture */}
      <div style={{ 
        width: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginRight: 30
      }}>
        {/* Profile Picture */}
        <div style={{ 
          width: 27,
          height: 27,
          borderRadius: '50%',
          border: '1px solid #FAC1D9',
          background: '#111827',
          flex: 'none',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={staff.profileImage ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${staff.profileImage}` : "/client img.png"}
            alt={staff.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%'
            }}
            onError={(e) => {
              e.target.src = "/client img.png";
            }}
          />
        </div>
        
        {/* Name and Role */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <div style={{ 
            fontFamily: 'Poppins',
            fontWeight: 400,
            fontSize: 14,
            color: '#FFFFFF',
            marginBottom: 2
          }}>
            {staff.name}
          </div>
          <div style={{ 
            fontFamily: 'Poppins',
            fontWeight: 400,
            fontSize: 12,
            color: '#FAC1D9'
          }}>
            {staff.role}
          </div>
        </div>
      </div>
      
      {/* Date */}
      <div style={{ 
        width: 120,
        fontFamily: 'Poppins',
        fontWeight: 400,
        fontSize: 14,
        color: '#FFFFFF',
        marginRight: 30
      }}>
        16-Apr-2024
      </div>
      
      {/* Timings */}
      <div style={{ 
        width: 140,
        fontFamily: 'Poppins',
        fontWeight: 400,
        fontSize: 14,
        color: '#FFFFFF',
        marginRight: 30
      }}>
        {staff.timings || '9am to 6pm'}
      </div>
      
      {/* Status Buttons - Only for ADMIN users */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        marginLeft: 'auto'
      }}>
        {user?.role === 'ADMIN' ? (
          attendanceStatus ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button style={{
                background: statusButtons.find(s => s.key === attendanceStatus)?.color || '#FAC1D9',
                color: statusButtons.find(s => s.key === attendanceStatus)?.textColor || '#333',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                {statusButtons.find(s => s.key === attendanceStatus)?.label}
              </button>
              <button style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 4,
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                <FiEdit3 size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              {statusButtons.map((status) => (
                <button
                  key={status.key}
                  onClick={() => onStatusChange(staff.dbId || staff.id, status.key)}
                  style={{
                    background: status.color,
                    color: status.textColor,
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {status.label}
                </button>
              ))}
            </div>
          )
        ) : (
          /* For non-admin users, just show the current status as read-only */
          <div style={{ 
            padding: '10px 16px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            background: attendanceStatus ? 
              (statusButtons.find(s => s.key === attendanceStatus)?.color || '#FAC1D9') : 
              '#3D4142',
            color: attendanceStatus ? 
              (statusButtons.find(s => s.key === attendanceStatus)?.textColor || '#333') : 
              '#FFFFFF'
          }}>
            {attendanceStatus ? 
              statusButtons.find(s => s.key === attendanceStatus)?.label : 
              'Not Set'
            }
          </div>
        )}
      </div>
    </div>
  );
}


// Dummy staff data for display
const DUMMY_STAFF = [
  {
    id: '#101',
    dbId: 'dummy-1',
    name: 'Sarah Johnson',
    role: 'MANAGER',
    email: 'sarah.johnson@cosypos.com',
    phone: '+1 (555) 123-4567',
    age: '32 yr',
    salary: '$4500.00',
    timings: '9am to 6pm',
    profileImage: null,
    active: true
  },
  {
    id: '#102',
    dbId: 'dummy-2',
    name: 'Michael Chen',
    role: 'CHEF',
    email: 'michael.chen@cosypos.com',
    phone: '+1 (555) 234-5678',
    age: '28 yr',
    salary: '$3800.00',
    timings: '10am to 7pm',
    profileImage: null,
    active: true
  },
  {
    id: '#103',
    dbId: 'dummy-3',
    name: 'Emily Rodriguez',
    role: 'WAITER',
    email: 'emily.rodriguez@cosypos.com',
    phone: '+1 (555) 345-6789',
    age: '24 yr',
    salary: '$2500.00',
    timings: '11am to 8pm',
    profileImage: null,
    active: true
  },
  {
    id: '#104',
    dbId: 'dummy-4',
    name: 'David Thompson',
    role: 'CASHIER',
    email: 'david.thompson@cosypos.com',
    phone: '+1 (555) 456-7890',
    age: '26 yr',
    salary: '$2800.00',
    timings: '9am to 6pm',
    profileImage: null,
    active: true
  },
  {
    id: '#105',
    dbId: 'dummy-5',
    name: 'Jessica Martinez',
    role: 'WAITER',
    email: 'jessica.martinez@cosypos.com',
    phone: '+1 (555) 567-8901',
    age: '23 yr',
    salary: '$2500.00',
    timings: '12pm to 9pm',
    profileImage: null,
    active: true
  },
  {
    id: '#106',
    dbId: 'dummy-6',
    name: 'James Wilson',
    role: 'SOUS_CHEF',
    email: 'james.wilson@cosypos.com',
    phone: '+1 (555) 678-9012',
    age: '30 yr',
    salary: '$3500.00',
    timings: '10am to 7pm',
    profileImage: null,
    active: true
  },
  {
    id: '#107',
    dbId: 'dummy-7',
    name: 'Olivia Brown',
    role: 'HOST',
    email: 'olivia.brown@cosypos.com',
    phone: '+1 (555) 789-0123',
    age: '22 yr',
    salary: '$2400.00',
    timings: '5pm to 12am',
    profileImage: null,
    active: true
  },
  {
    id: '#108',
    dbId: 'dummy-8',
    name: 'Robert Anderson',
    role: 'BARTENDER',
    email: 'robert.anderson@cosypos.com',
    phone: '+1 (555) 890-1234',
    age: '29 yr',
    salary: '$3000.00',
    timings: '6pm to 2am',
    profileImage: null,
    active: true
  },
  {
    id: '#109',
    dbId: 'dummy-9',
    name: 'Sophia Lee',
    role: 'WAITER',
    email: 'sophia.lee@cosypos.com',
    phone: '+1 (555) 901-2345',
    age: '25 yr',
    salary: '$2600.00',
    timings: '11am to 8pm',
    profileImage: null,
    active: true
  },
  {
    id: '#110',
    dbId: 'dummy-10',
    name: 'Daniel Garcia',
    role: 'KITCHEN_HELPER',
    email: 'daniel.garcia@cosypos.com',
    phone: '+1 (555) 012-3456',
    age: '21 yr',
    salary: '$2200.00',
    timings: '8am to 5pm',
    profileImage: null,
    active: true
  },
  {
    id: '#111',
    dbId: 'dummy-11',
    name: 'Emma Taylor',
    role: 'MANAGER',
    email: 'emma.taylor@cosypos.com',
    phone: '+1 (555) 123-4568',
    age: '35 yr',
    salary: '$4800.00',
    timings: '9am to 6pm',
    profileImage: null,
    active: true
  },
  {
    id: '#112',
    dbId: 'dummy-12',
    name: 'Christopher White',
    role: 'DELIVERY_DRIVER',
    email: 'chris.white@cosypos.com',
    phone: '+1 (555) 234-5679',
    age: '27 yr',
    salary: '$2700.00',
    timings: '10am to 7pm',
    profileImage: null,
    active: true
  }
];

export default function Staff() {
  const { user } = useUser();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editInitial, setEditInitial] = useState(null);
  const [activeTab, setActiveTab] = useState('management'); // 'management' or 'attendance'
  const [attendanceRecords, setAttendanceRecords] = useState([]); // Track attendance records from database
  const [staffStatusMap, setStaffStatusMap] = useState({}); // Local state for staff management status (dummy)
  const [sortBy, setSortBy] = useState('name'); // Default sort by name
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [list, setList] = useState(DUMMY_STAFF); // Initialize with dummy data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, staffId: null, staffName: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch staff data from database
  useEffect(() => {
    fetchStaffData();
    if (activeTab === 'attendance') {
      fetchAttendanceData();
    }
  }, [activeTab]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/users/staff');
      
      // Format the data for display with sequential IDs
      const formattedStaff = response.map((staff, index) => ({
        id: `#${String(DUMMY_STAFF.length + index + 101).padStart(3, '0')}`, // Start after dummy data
        dbId: staff.id, // Keep original database ID for operations
        name: staff.name || 'Unknown',
        role: staff.role || 'STAFF',
        email: staff.email || 'No email',
        phone: staff.phone || '',
        age: staff.age ? `${staff.age} yr` : '',
        salary: staff.salary ? `$${parseFloat(staff.salary).toFixed(2)}` : '',
        timings: staff.timings || '',
        profileImage: staff.profileImage,
        active: true
      }));
      
      // Merge dummy data with real data
      setList([...DUMMY_STAFF, ...formattedStaff]);
    } catch (error) {
      console.error('Error fetching staff:', error);
      // Keep dummy data visible even if API fails
      setList(DUMMY_STAFF);
      // Preserve error state so UI can show error banner while displaying dummy data
      setError(error.message || 'Failed to fetch staff from server');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const today = new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format in local timezone
      const response = await api.get(`/api/attendance?date=${today}`);
      setAttendanceRecords(response);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const openAdd = () => { setEditInitial(null); setPanelOpen(true); };
  const openEdit = (s) => { setEditInitial(s); setPanelOpen(true); };
  
  const onClosePanel = async (updated) => {
    setPanelOpen(false);
    if (updated) {
      // Refresh the staff list after adding or editing
      await fetchStaffData();
      showToast(
        editInitial ? 'Staff member updated successfully' : 'Staff member added successfully',
        'success'
      );
    }
  };
  
  const onDelete = (staff) => {
    setDeleteConfirm({
      show: true,
      staffId: staff.dbId || staff.id,
      staffName: staff.name
    });
  };
  
  const confirmDelete = async () => {
    const { staffId, staffName } = deleteConfirm;
    setDeleteConfirm({ show: false, staffId: null, staffName: '' });
    
    // Check if this is a dummy staff member
    if (staffId.startsWith('dummy-')) {
      // Just remove from local state for dummy data
      setList((prev) => prev.filter((p) => p.dbId !== staffId));
      showToast(`${staffName} has been removed`, 'success');
      return;
    }
    
    try {
      await api.delete(`/api/users/${staffId}`);
      // Remove from local state immediately for better UX
      setList((prev) => prev.filter((p) => p.dbId !== staffId));
      showToast(`${staffName} has been deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting staff:', error);
      showToast('Failed to delete staff member. Please try again.', 'error');
    }
  };
  
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, staffId: null, staffName: '' });
  };
  
  const handleStaffStatusChange = (staffId, status) => {
    // Update local state (dummy - no backend)
    setStaffStatusMap(prev => ({
      ...prev,
      [staffId]: status
    }));
    
    const statusLabels = {
      'present': 'Present',
      'absent': 'Absent',
      'half': 'Half Shift',
      'leave': 'Leave'
    };
    
    showToast(`Status marked as ${statusLabels[status]}`, 'success');
  };

  const handleAttendanceStatusChange = async (staffDbId, status) => {
    try {
      // Map status to backend enum values
      const statusMap = {
        'present': 'PRESENT',
        'absent': 'ABSENT',
        'half': 'HALF_SHIFT',
        'leave': 'LEAVE'
      };

      await api.post('/api/attendance', {
        userId: staffDbId,
        status: statusMap[status],
        date: new Date().toISOString()
      });
      
      // Refresh attendance data
      await fetchAttendanceData();
      showToast('Attendance updated successfully', 'success');
    } catch (error) {
      console.error('Error updating attendance:', error);
      showToast('Failed to update attendance. Please try again.', 'error');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortStaff = (staffList) => {
    return [...staffList].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'phone':
          aValue = a.phone;
          bValue = b.phone;
          break;
        case 'age':
          aValue = parseInt(a.age);
          bValue = parseInt(b.age);
          break;
        case 'salary':
          aValue = parseFloat(a.salary.replace('$', '').replace(',', ''));
          bValue = parseFloat(b.salary.replace('$', '').replace(',', ''));
          break;
        case 'timings':
          aValue = a.timings.toLowerCase();
          bValue = b.timings.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedList = useMemo(() => sortStaff(list), [list, sortBy, sortOrder]);
  
  const rows = useMemo(() => sortedList.map((s, i) => (
    <StaffRow 
      key={s.id} 
      staff={s} 
      onEdit={openEdit} 
      onDelete={onDelete} 
      zebra={i % 2 === 1} 
      user={user} 
      attendanceStatus={staffStatusMap[s.dbId || s.id]}
      onStatusChange={handleStaffStatusChange}
    />
  )), [sortedList, user, staffStatusMap]);

  // Helper to get attendance status for a staff member
  const getAttendanceStatus = (staffDbId) => {
    const record = attendanceRecords.find(rec => rec.userId === staffDbId);
    if (!record) return null;
    
    // Map backend status to frontend status
    const statusMap = {
      'PRESENT': 'present',
      'ABSENT': 'absent',
      'HALF_SHIFT': 'half',
      'LEAVE': 'leave'
    };
    
    return statusMap[record.status] || null;
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative', overflowX: 'hidden' }}>
        <Sidebar />
        <Header onAdd={openAdd} count={list.length} activeTab={activeTab} setActiveTab={setActiveTab} sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} user={user} />
        <main className="page-main-content" style={{ 
          paddingTop: 20, 
          paddingBottom: 40, 
          paddingLeft: 192, 
          paddingRight: 16, 
          maxWidth: '100%', 
          boxSizing: 'border-box',
          marginLeft: 0
        }}>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 400,
              fontSize: 18,
              color: colors.muted 
            }}>
              Loading staff data...
            </div>
          ) : error ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 400,
              fontSize: 18,
              color: '#E70000' 
            }}>
              {error}
            </div>
          ) : activeTab === 'management' ? (
            <div style={{ 
              width: '100%', 
              maxWidth: '1100px',
              margin: '0 auto',
              overflowX: 'auto',
              overflowY: 'visible',
              WebkitOverflowScrolling: 'touch',
              borderRadius: 10,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ minWidth: 950, width: '100%' }}>
                {/* Column Headers */}
                <div style={{ 
                  width: '100%',
                  height: 50,
                  background: colors.panel,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 20px',
                  marginBottom: 1,
                  borderBottom: '1px solid #3D4142',
                  boxSizing: 'border-box'
                }}>
                  {/* Checkbox column */}
                  <div style={{ width: 20, marginRight: 15 }}></div>
                  
                  {/* ID */}
                  <div style={{ 
                    width: 45,
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginRight: 15
                  }}>ID</div>
                  
                  {/* Name */}
                  <div style={{ 
                    width: 180,
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginRight: 15
                  }}>Name</div>
                  
                  {/* Email */}
                  <div style={{ 
                    width: 160,
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginRight: 15
                  }}>Email</div>
                  
                  {/* Phone */}
                  <div style={{ 
                    width: 110,
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginRight: 15
                  }}>Phone</div>
                  
                   {/* Age */}
                   <div style={{ 
                     width: 50,
                     fontFamily: 'Poppins',
                     fontWeight: 500,
                     fontSize: 14,
                     color: '#FFFFFF',
                     textAlign: 'center',
                     marginRight: 15
                   }}>Age</div>
                   
                   {/* Salary */}
                   <div style={{ 
                     width: 75,
                     fontFamily: 'Poppins',
                     fontWeight: 500,
                     fontSize: 14,
                     color: '#FFFFFF',
                     textAlign: 'right',
                     marginRight: 15
                   }}>Salary</div>
                   
                   {/* Timings */}
                   <div style={{ 
                     width: 85,
                     fontFamily: 'Poppins',
                     fontWeight: 500,
                     fontSize: 14,
                     color: '#FFFFFF',
                     textAlign: 'center',
                     marginRight: 15
                   }}>Timings</div>
                   
                   {/* Status */}
                   <div style={{ 
                     fontFamily: 'Poppins',
                     fontWeight: 500,
                     fontSize: 14,
                     color: '#FFFFFF',
                     marginRight: 20,
                     minWidth: 120
                   }}>Status</div>
                   
                   {/* Actions */}
                   <div style={{ 
                     fontFamily: 'Poppins',
                     fontWeight: 500,
                     fontSize: 14,
                     color: '#FFFFFF',
                     marginLeft: 'auto',
                    minWidth: 140,
                    textAlign: 'right',
                    paddingRight: 20
                   }}>Actions</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {rows}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              maxWidth: '1100px',
              margin: '0 auto',
              overflowX: 'auto',
              overflowY: 'visible',
              WebkitOverflowScrolling: 'touch',
              borderRadius: 10,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ minWidth: 900, width: '100%' }}>
                {/* Attendance Column Headers */}
                <div style={{ 
                  width: '100%',
                  height: 50,
                  background: colors.panel,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 20px',
                  marginBottom: 1,
                  borderBottom: '1px solid #3D4142',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ width: 20, marginRight: 20 }}></div>
                  <div style={{ 
                    width: 60,
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginRight: 30
                  }}>ID</div>
                  <div style={{ 
                    width: 200,
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginRight: 30
                  }}>Name</div>
                  <div style={{ 
                    width: 120,
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginRight: 30
                  }}>Date</div>
                  <div style={{ 
                    width: 140,
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginRight: 30
                  }}>Timings</div>
                  <div style={{ 
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginLeft: 'auto'
                  }}>Status</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {list.map((staff, i) => (
                    <AttendanceRow 
                      key={staff.dbId || staff.id} 
                      staff={staff} 
                      attendanceStatus={getAttendanceStatus(staff.dbId || staff.id)}
                      onStatusChange={handleAttendanceStatusChange}
                      zebra={i % 2 === 1}
                      user={user}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.8)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            background: colors.panel, 
            borderRadius: 16, 
            padding: 32,
            maxWidth: 440,
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ 
              fontSize: 22, 
              fontWeight: 600, 
              marginBottom: 12,
              color: colors.text
            }}>
              Delete Staff Member
            </div>
            <div style={{ 
              fontSize: 14, 
              color: colors.muted, 
              marginBottom: 24,
              lineHeight: 1.6
            }}>
              Are you sure you want to delete <strong style={{ color: colors.text }}>{deleteConfirm.staffName}</strong>? This action cannot be undone.
            </div>
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              justifyContent: 'flex-end' 
            }}>
              <button 
                onClick={cancelDelete}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: 8, 
                  background: colors.inputBg, 
                  border: 'none', 
                  color: colors.text, 
                  fontSize: 14, 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#4A4F50'}
                onMouseLeave={(e) => e.target.style.background = colors.inputBg}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{ 
                  padding: '12px 24px', 
                  borderRadius: 8, 
                  background: '#E70000', 
                  border: 'none', 
                  color: '#FFFFFF', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#C50000'}
                onMouseLeave={(e) => e.target.style.background = '#E70000'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AddEditPanel open={panelOpen} onClose={onClosePanel} initial={editInitial} />
      
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


