import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import HeaderBar from './HeaderBar.jsx';

const colors = { 
  bg: '#111315', 
  text: '#FFFFFF', 
  panel: '#292C2D',
  accent: '#FAC1D9',
  muted: '#777979',
  gridLine: '#3D4142'
};

export default function ReservationDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const reservation = location.state?.reservation;

  if (!reservation) {
    navigate('/reservation');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, overflowX: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative' }}>
        <Sidebar />
        <HeaderBar title="Reservation Details" showBackButton={true} right={(
          <>
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
          </>
        )} />
        
        <main style={{ 
          paddingLeft: 208, 
          paddingRight: 32, 
          paddingTop: 16, 
          paddingBottom: 16,
          height: 'calc(100vh - 80px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/reservation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: colors.text,
              cursor: 'pointer',
              padding: '6px 0',
              marginBottom: '16px',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            <ChevronLeft size={18} />
            Back to Reservations
          </button>

          {/* Table Image */}
          <div style={{
            width: '100%',
            height: '200px',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px',
            position: 'relative',
            background: colors.panel,
            flexShrink: 0
          }}>
            <img 
              src="/reservation table.png" 
              alt="Table"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '8px 16px',
              borderRadius: '6px',
              color: colors.text,
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Table # {reservation.table}
            </div>
          </div>

          {/* Content Container - Scrollable */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            minHeight: 0,
            paddingRight: '8px'
          }}>
            {/* Reservation Details Section */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '12px'
              }}>
                Reservation Details
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '12px',
                background: colors.panel,
                padding: '16px',
                borderRadius: '8px'
              }}>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Table Number</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>{reservation.table}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Pax Number</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>{reservation.guests.toString().padStart(2, '0')} persons</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Reservation Date</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>28. 03. 2024</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Reservation Time</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>{reservation.startTime} PM</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Deposit Fee</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>60 . 00 $</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Status</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>Confirmed</div>
              </div>
            </div>
          </div>

          {/* Customer Details Section */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: colors.text,
              marginBottom: '12px'
            }}>
              Customer Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              background: colors.panel,
              padding: '16px',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Title</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>Mr</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Full Name</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>Watson Joyce</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Phone number</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>+1 (123) 123 4654</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Email Address</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>watsonjoycell2@gmail.com</div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: colors.text,
              marginBottom: '12px'
            }}>
              Additional Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              background: colors.panel,
              padding: '16px',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Customer ID</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>#12354564</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Payment Method</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>Visa Card</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Name</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>Watson Joyce</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: colors.muted, marginBottom: '6px' }}>Card Number</div>
                <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>**** **** 4564 4546 4546</div>
              </div>
            </div>
          </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: `1px solid ${colors.gridLine}`,
            flexShrink: 0
          }}>
            <button
              onClick={() => navigate('/reservation')}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${colors.gridLine}`,
                color: colors.text,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = colors.panel}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Cancel Reservation
            </button>
            <button
              onClick={() => navigate('/reservation')}
              style={{
                padding: '10px 20px',
                background: colors.accent,
                border: 'none',
                color: '#333333',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
              onMouseLeave={(e) => e.target.style.background = colors.accent}
            >
              Change Table
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

