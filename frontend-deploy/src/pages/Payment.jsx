import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import Toast from '../components/Toast.jsx';

const colors = { 
  bg: '#111315', 
  text: '#FFFFFF', 
  panel: '#292C2D',
  accent: '#FAC1D9',
  muted: '#777979'
}

export default function Payment({ order, onPaymentComplete, onCancel }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete();
      showToast('Payment successful! Order completed.', 'success');
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
      <style>
        {`
          @keyframes slideInRight {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
      
      <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{
          background: colors.panel,
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.muted}`
        }}>
          <div>
            <h1 style={{ 
              fontSize: 24, 
              fontWeight: 600, 
              color: colors.text, 
              margin: 0 
            }}>
              Payment
            </h1>
            <p style={{ 
              fontSize: 14, 
              color: colors.muted, 
              margin: '4px 0 0 0' 
            }}>
              Complete your order payment
            </p>
          </div>
          
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.muted,
              fontSize: 24,
              cursor: 'pointer',
              padding: 8,
              borderRadius: 4
            }}
            onMouseEnter={(e) => e.target.style.color = colors.text}
            onMouseLeave={(e) => e.target.style.color = colors.muted}
          >
            ×
          </button>
        </div>

        <div style={{ 
          padding: '32px',
          display: 'flex',
          gap: 32,
          maxWidth: 1200,
          margin: '0 auto'
        }}>
          {/* Order Summary */}
          <div style={{ 
            flex: 1,
            background: colors.panel,
            borderRadius: 12,
            padding: 24,
            height: 'fit-content'
          }}>
            <h2 style={{ 
              fontSize: 20, 
              fontWeight: 600, 
              color: colors.text, 
              marginBottom: 20 
            }}>
              Order Summary
            </h2>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 500, 
                color: colors.text,
                marginBottom: 8
              }}>
                Order #{order?.orderNumber}
              </div>
              <div style={{ 
                fontSize: 14, 
                color: colors.muted 
              }}>
                Customer: {order?.customerName}
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: 20 }}>
              {order?.items?.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: `1px solid ${colors.muted}20`
                }}>
                  <div>
                    <div style={{ fontSize: 14, color: colors.text }}>
                      {item.name} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              borderTop: `2px solid ${colors.accent}`,
              fontSize: 18,
              fontWeight: 600,
              color: colors.text
            }}>
              <span>Total</span>
              <span>${order?.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          {/* Payment Form */}
          <div style={{ 
            flex: 1,
            background: colors.panel,
            borderRadius: 12,
            padding: 24
          }}>
            <h2 style={{ 
              fontSize: 20, 
              fontWeight: 600, 
              color: colors.text, 
              marginBottom: 20 
            }}>
              Payment Details
            </h2>

            {/* Payment Method Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                fontSize: 14,
                fontWeight: 500,
                color: colors.text,
                marginBottom: 12,
                display: 'block'
              }}>
                Payment Method
              </label>
              
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { value: 'card', label: 'Credit Card', icon: '💳' },
                  { value: 'cash', label: 'Cash', icon: '💵' },
                  { value: 'digital', label: 'Digital Wallet', icon: '📱' }
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: paymentMethod === method.value ? colors.accent : 'transparent',
                      border: `2px solid ${paymentMethod === method.value ? colors.accent : colors.muted}`,
                      borderRadius: 8,
                      color: paymentMethod === method.value ? '#333333' : colors.text,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{method.icon}</span>
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details (if card selected) */}
            {paymentMethod === 'card' && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: colors.text,
                    marginBottom: 8,
                    display: 'block'
                  }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 12,
                      background: colors.bg,
                      border: `1px solid ${colors.muted}`,
                      borderRadius: 6,
                      color: colors.text,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: colors.text,
                      marginBottom: 8,
                      display: 'block'
                    }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 12,
                        background: colors.bg,
                        border: `1px solid ${colors.muted}`,
                        borderRadius: 6,
                        color: colors.text,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: colors.text,
                      marginBottom: 8,
                      display: 'block'
                    }}>
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 12,
                        background: colors.bg,
                        border: `1px solid ${colors.muted}`,
                        borderRadius: 6,
                        color: colors.text,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'transparent',
                  border: `1px solid ${colors.muted}`,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = colors.muted;
                  e.target.style.color = colors.text;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = colors.text;
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                style={{
                  flex: 2,
                  padding: '16px',
                  background: isProcessing ? colors.muted : colors.accent,
                  border: 'none',
                  borderRadius: 8,
                  color: isProcessing ? colors.text : '#333333',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {isProcessing ? (
                  <>
                    <div style={{
                      width: 16,
                      height: 16,
                      border: '2px solid #333333',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Processing...
                  </>
                ) : (
                  <>
                    💳 Pay ${order?.subtotal?.toFixed(2) || '0.00'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
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
