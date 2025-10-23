import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, User, DollarSign, TrendingUp, Users, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import Sidebar from './Sidebar.jsx'
import HeaderBar from './HeaderBar.jsx'
import { useUser } from './UserContext.jsx'

const colors = { 
  bg: '#111315', 
  text: '#FFFFFF', 
  panel: '#292C2D',
  accent: '#FAC1D9',
  muted: '#777979'
}

// Sample data for charts
const reservationData = [
  { name: 'Confirmed', value: 110, color: '#FAC1D9' },
  { name: 'Awaited', value: 45, color: '#E8A8C8' },
  { name: 'Cancelled', value: 25, color: '#D18BB8' },
  { name: 'Failed', value: 12, color: '#BA6EA8' }
];

const trendData = [
  { month: 'JAN', confirmed: 1200, awaited: 800 },
  { month: 'FEB', confirmed: 1500, awaited: 900 },
  { month: 'MAR', confirmed: 1800, awaited: 1000 },
  { month: 'APR', confirmed: 2200, awaited: 1200 },
  { month: 'MAY', confirmed: 2500, awaited: 1400 },
  { month: 'JUN', confirmed: 2800, awaited: 1600 },
  { month: 'JUL', confirmed: 3200, awaited: 1800 },
  { month: 'AUG', confirmed: 3500, awaited: 2000 },
  { month: 'SEP', confirmed: 4000, awaited: 2200 },
  { month: 'OCT', confirmed: 3800, awaited: 2000 },
  { month: 'NOV', confirmed: 3600, awaited: 1800 },
  { month: 'DEC', confirmed: 3400, awaited: 1600 }
];

// Revenue data
const revenueData = [
  { month: 'JAN', revenue: 45000, profit: 12000, expenses: 33000 },
  { month: 'FEB', revenue: 52000, profit: 15000, expenses: 37000 },
  { month: 'MAR', revenue: 48000, profit: 13000, expenses: 35000 },
  { month: 'APR', revenue: 61000, profit: 18000, expenses: 43000 },
  { month: 'MAY', revenue: 67000, profit: 20000, expenses: 47000 },
  { month: 'JUN', revenue: 72000, profit: 22000, expenses: 50000 },
  { month: 'JUL', revenue: 78000, profit: 25000, expenses: 53000 },
  { month: 'AUG', revenue: 85000, profit: 28000, expenses: 57000 },
  { month: 'SEP', revenue: 92000, profit: 30000, expenses: 62000 },
  { month: 'OCT', revenue: 88000, profit: 27000, expenses: 61000 },
  { month: 'NOV', revenue: 76000, profit: 24000, expenses: 52000 },
  { month: 'DEC', revenue: 68000, profit: 21000, expenses: 47000 }
];

const revenueSources = [
  { name: 'Dine-in', value: 45, amount: 125000, color: '#FAC1D9' },
  { name: 'Takeaway', value: 30, amount: 85000, color: '#E8A8C8' },
  { name: 'Delivery', value: 20, amount: 55000, color: '#D18BB8' },
  { name: 'Catering', value: 5, amount: 15000, color: '#BA6EA8' }
];

// Staff data
const staffPerformance = [
  { name: 'John Smith', role: 'Manager', hours: 40, efficiency: 95, sales: 15000 },
  { name: 'Sarah Johnson', role: 'Server', hours: 35, efficiency: 88, sales: 12000 },
  { name: 'Mike Wilson', role: 'Chef', hours: 42, efficiency: 92, sales: 18000 },
  { name: 'Emily Davis', role: 'Server', hours: 32, efficiency: 85, sales: 11000 },
  { name: 'David Brown', role: 'Host', hours: 38, efficiency: 90, sales: 8000 }
];

const attendanceData = [
  { month: 'JAN', present: 95, absent: 5, late: 3 },
  { month: 'FEB', present: 92, absent: 8, late: 4 },
  { month: 'MAR', present: 96, absent: 4, late: 2 },
  { month: 'APR', present: 94, absent: 6, late: 5 },
  { month: 'MAY', present: 98, absent: 2, late: 1 },
  { month: 'JUN', present: 93, absent: 7, late: 3 },
  { month: 'JUL', present: 97, absent: 3, late: 2 },
  { month: 'AUG', present: 95, absent: 5, late: 4 },
  { month: 'SEP', present: 96, absent: 4, late: 2 },
  { month: 'OCT', present: 94, absent: 6, late: 3 },
  { month: 'NOV', present: 97, absent: 3, late: 1 },
  { month: 'DEC', present: 95, absent: 5, late: 2 }
];

const reservationDetails = [
  {
    id: '#12354564',
    customerName: 'Watson Joyce',
    phone: '+1 (123) 123 4654',
    reservationDate: '28. 03. 2024',
    checkIn: '03:18 PM',
    checkOut: '05:00 PM',
    total: '$250.00',
    status: 'Confirmed'
  },
  {
    id: '#12354565',
    customerName: 'Sarah Johnson',
    phone: '+1 (123) 123 4655',
    reservationDate: '29. 03. 2024',
    checkIn: '02:30 PM',
    checkOut: '04:30 PM',
    total: '$180.00',
    status: 'Confirmed'
  },
  {
    id: '#12354566',
    customerName: 'Mike Wilson',
    phone: '+1 (123) 123 4656',
    reservationDate: '30. 03. 2024',
    checkIn: '01:45 PM',
    checkOut: '03:45 PM',
    total: '$320.00',
    status: 'Awaited'
  },
  {
    id: '#12354567',
    customerName: 'Emily Davis',
    phone: '+1 (123) 123 4657',
    reservationDate: '31. 03. 2024',
    checkIn: '04:00 PM',
    checkOut: '06:00 PM',
    total: '$275.00',
    status: 'Confirmed'
  },
  {
    id: '#12354568',
    customerName: 'David Brown',
    phone: '+1 (123) 123 4658',
    reservationDate: '01. 04. 2024',
    checkIn: '12:30 PM',
    checkOut: '02:30 PM',
    total: '$195.00',
    status: 'Cancelled'
  }
];

export default function Reports() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('reservation');
  const [activeFilter, setActiveFilter] = useState('Confirmed');
  const [dateRange, setDateRange] = useState('01/04/2024 — 08/04/2024');

  const totalReservations = reservationData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: colors.panel,
          border: `1px solid ${colors.accent}`,
          borderRadius: 8,
          padding: '8px 12px',
          color: colors.text,
          fontSize: 12
        }}>
          <p>{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, overflowX: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '100vw', margin: '0 auto', position: 'relative' }}>
        <Sidebar />
        <HeaderBar title="Reports" showBackButton={true} right={(
          <>
            {/* Date Range Picker */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              background: colors.panel,
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${colors.muted}`
            }}>
              <Calendar size={16} color={colors.muted} />
              <span style={{ fontSize: 14, color: colors.text }}>{dateRange}</span>
            </div>

            {/* Generate Report Button */}
            <button style={{
              background: colors.accent,
              color: '#333333',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#E8A8C8'}
            onMouseLeave={(e) => e.target.style.background = colors.accent}
            >
              Generate Report
            </button>

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
                <Bell size={20} color="#FFFFFF" />
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
          </>
        )} />
        
        <main style={{ paddingLeft: 208, paddingRight: 32, paddingTop: 20, paddingBottom: 32 }}>
          <div style={{ background: colors.panel, borderRadius: 10, padding: 24 }}>
            {/* Report Type Tabs */}
            <div style={{ 
              display: 'flex', 
              gap: 8, 
              marginBottom: 32,
              borderBottom: `1px solid ${colors.muted}`
            }}>
              {[
                { id: 'reservation', label: 'Reservation Report' },
                { id: 'revenue', label: 'Revenue Report' },
                { id: 'staff', label: 'Staff Report' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? colors.accent : 'transparent',
                    color: activeTab === tab.id ? '#333333' : colors.text,
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    padding: '12px 24px',
                    fontSize: 16,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'reservation' && (
              <>
                {/* Charts Section */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: 24, 
                  marginBottom: 32 
                }}>
                  {/* Total Reservation Donut Chart */}
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 24,
                    border: `1px solid ${colors.muted}`
                  }}>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 600, 
                      marginBottom: 20,
                      color: colors.text
                    }}>
                      Total Reservation
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ width: 200, height: 200, minWidth: 200, minHeight: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reservationData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {reservationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: 24, fontWeight: 600, color: colors.text }}>
                            Total
                          </div>
                          <div style={{ fontSize: 32, fontWeight: 700, color: colors.accent }}>
                            {totalReservations}
                          </div>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {reservationData.map((item, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 12, 
                            marginBottom: 12 
                          }}>
                            <div style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              background: item.color
                            }} />
                            <span style={{ fontSize: 14, color: colors.text }}>
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reservation Trend Graph */}
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 24,
                    border: `1px solid ${colors.muted}`
                  }}>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 600, 
                      marginBottom: 20,
                      color: colors.text
                    }}>
                      Reservation Trend
                    </h3>
                    
                    {/* Filter Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      gap: 8, 
                      marginBottom: 20 
                    }}>
                      {['Confirmed', 'Awaited', 'Cancelled', 'Failed'].map(filter => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          style={{
                            background: activeFilter === filter ? colors.accent : 'transparent',
                            color: activeFilter === filter ? '#333333' : colors.text,
                            border: `1px solid ${activeFilter === filter ? colors.accent : colors.muted}`,
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    <div style={{ height: 200, minHeight: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={colors.muted} />
                          <XAxis 
                            dataKey="month" 
                            stroke={colors.text}
                            fontSize={12}
                          />
                          <YAxis 
                            stroke={colors.text}
                            fontSize={12}
                            domain={[0, 5000]}
                            ticks={[0, 1000, 2000, 3000, 4000, 5000]}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="confirmed" 
                            stroke={colors.accent} 
                            strokeWidth={3}
                            dot={{ fill: colors.accent, strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="awaited" 
                            stroke={colors.muted} 
                            strokeWidth={2}
                            dot={{ fill: colors.muted, strokeWidth: 2, r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Reservation Details Table */}
                <div style={{ 
                  background: colors.bg, 
                  borderRadius: 12, 
                  padding: 24,
                  border: `1px solid ${colors.muted}`
                }}>
                  <h3 style={{ 
                    fontSize: 18, 
                    fontWeight: 600, 
                    marginBottom: 20,
                    color: colors.text
                  }}>
                    Reservation Details
                  </h3>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      fontSize: 14
                    }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${colors.muted}` }}>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Reservation ID
                          </th>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Customer Name
                          </th>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Phone number
                          </th>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Reservation Date
                          </th>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Check In
                          </th>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Check Out
                          </th>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservationDetails.map((reservation, index) => (
                          <tr key={index} style={{ 
                            borderBottom: `1px solid ${colors.muted}`,
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = colors.panel}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.text,
                              fontWeight: 500
                            }}>
                              {reservation.id}
                            </td>
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.text
                            }}>
                              {reservation.customerName}
                            </td>
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.text
                            }}>
                              {reservation.phone}
                            </td>
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.text
                            }}>
                              {reservation.reservationDate}
                            </td>
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.text
                            }}>
                              {reservation.checkIn}
                            </td>
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.text
                            }}>
                              {reservation.checkOut}
                            </td>
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.accent,
                              fontWeight: 600
                            }}>
                              {reservation.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'revenue' && (
              <>
                {/* Revenue Summary Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: 16, 
                  marginBottom: 32 
                }}>
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 20,
                    border: `1px solid ${colors.muted}`,
                    textAlign: 'center'
                  }}>
                    <DollarSign size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                      $847,000
                    </div>
                    <div style={{ fontSize: 14, color: colors.muted }}>Total Revenue</div>
                  </div>
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 20,
                    border: `1px solid ${colors.muted}`,
                    textAlign: 'center'
                  }}>
                    <TrendingUp size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                      $247,000
                    </div>
                    <div style={{ fontSize: 14, color: colors.muted }}>Total Profit</div>
                  </div>
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 20,
                    border: `1px solid ${colors.muted}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.accent, marginBottom: 4 }}>
                      29.2%
                    </div>
                    <div style={{ fontSize: 14, color: colors.muted }}>Profit Margin</div>
                  </div>
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 20,
                    border: `1px solid ${colors.muted}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                      $70,583
                    </div>
                    <div style={{ fontSize: 14, color: colors.muted }}>Avg Monthly</div>
                  </div>
                </div>

                {/* Revenue Charts Section */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: 24, 
                  marginBottom: 32 
                }}>
                  {/* Revenue Trend Chart */}
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 24,
                    border: `1px solid ${colors.muted}`
                  }}>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 600, 
                      marginBottom: 20,
                      color: colors.text
                    }}>
                      Revenue Trend
                    </h3>
                    <div style={{ height: 300, minHeight: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={colors.muted} />
                          <XAxis dataKey="month" stroke={colors.text} fontSize={12} />
                          <YAxis stroke={colors.text} fontSize={12} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke={colors.accent} 
                            fill={colors.accent}
                            fillOpacity={0.3}
                            strokeWidth={3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenue Sources Pie Chart */}
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 24,
                    border: `1px solid ${colors.muted}`
                  }}>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 600, 
                      marginBottom: 20,
                      color: colors.text
                    }}>
                      Revenue Sources
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ width: 200, height: 200, minWidth: 200, minHeight: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={revenueSources}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {revenueSources.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ flex: 1 }}>
                        {revenueSources.map((item, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            marginBottom: 12 
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: item.color
                              }} />
                              <span style={{ fontSize: 14, color: colors.text }}>
                                {item.name}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                                ${item.amount.toLocaleString()}
                              </div>
                              <div style={{ fontSize: 12, color: colors.muted }}>
                                {item.value}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profit vs Expenses Chart */}
                <div style={{ 
                  background: colors.bg, 
                  borderRadius: 12, 
                  padding: 24,
                  border: `1px solid ${colors.muted}`,
                  marginBottom: 32
                }}>
                  <h3 style={{ 
                    fontSize: 18, 
                    fontWeight: 600, 
                    marginBottom: 20,
                    color: colors.text
                  }}>
                    Profit vs Expenses
                  </h3>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.muted} />
                        <XAxis dataKey="month" stroke={colors.text} fontSize={12} />
                        <YAxis stroke={colors.text} fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="profit" fill={colors.accent} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" fill={colors.muted} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'staff' && (
              <>
                {/* Staff Summary Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: 16, 
                  marginBottom: 32 
                }}>
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 20,
                    border: `1px solid ${colors.muted}`,
                    textAlign: 'center'
                  }}>
                    <Users size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                      5
                    </div>
                    <div style={{ fontSize: 14, color: colors.muted }}>Total Staff</div>
                  </div>
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 20,
                    border: `1px solid ${colors.muted}`,
                    textAlign: 'center'
                  }}>
                    <Clock size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                      95.2%
                    </div>
                    <div style={{ fontSize: 14, color: colors.muted }}>Attendance Rate</div>
                  </div>
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 20,
                    border: `1px solid ${colors.muted}`,
                    textAlign: 'center'
                  }}>
                    <TrendingUp size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                      90.2%
                    </div>
                    <div style={{ fontSize: 14, color: colors.muted }}>Avg Efficiency</div>
                  </div>
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 20,
                    border: `1px solid ${colors.muted}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                      $64,000
                    </div>
                    <div style={{ fontSize: 14, color: colors.muted }}>Total Sales</div>
                  </div>
                </div>

                {/* Staff Charts Section */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: 24, 
                  marginBottom: 32 
                }}>
                  {/* Staff Performance Chart */}
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 24,
                    border: `1px solid ${colors.muted}`
                  }}>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 600, 
                      marginBottom: 20,
                      color: colors.text
                    }}>
                      Staff Performance
                    </h3>
                    <div style={{ height: 300, minHeight: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={staffPerformance} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" stroke={colors.muted} />
                          <XAxis type="number" stroke={colors.text} fontSize={12} />
                          <YAxis dataKey="name" type="category" stroke={colors.text} fontSize={12} width={100} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="efficiency" fill={colors.accent} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Attendance Trend Chart */}
                  <div style={{ 
                    background: colors.bg, 
                    borderRadius: 12, 
                    padding: 24,
                    border: `1px solid ${colors.muted}`
                  }}>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 600, 
                      marginBottom: 20,
                      color: colors.text
                    }}>
                      Attendance Trend
                    </h3>
                    <div style={{ height: 300, minHeight: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={attendanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={colors.muted} />
                          <XAxis dataKey="month" stroke={colors.text} fontSize={12} />
                          <YAxis stroke={colors.text} fontSize={12} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="present" 
                            stroke={colors.accent} 
                            strokeWidth={3}
                            dot={{ fill: colors.accent, strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="absent" 
                            stroke="#FF6B6B" 
                            strokeWidth={2}
                            dot={{ fill: "#FF6B6B", strokeWidth: 2, r: 3 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="late" 
                            stroke="#FFD93D" 
                            strokeWidth={2}
                            dot={{ fill: "#FFD93D", strokeWidth: 2, r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Staff Performance Table */}
                <div style={{ 
                  background: colors.bg, 
                  borderRadius: 12, 
                  padding: 24,
                  border: `1px solid ${colors.muted}`
                }}>
                  <h3 style={{ 
                    fontSize: 18, 
                    fontWeight: 600, 
                    marginBottom: 20,
                    color: colors.text
                  }}>
                    Staff Performance Details
                  </h3>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      fontSize: 14
                    }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${colors.muted}` }}>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Staff Name
                          </th>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Role
                          </th>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Hours/Week
                          </th>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Efficiency
                          </th>
                          <th style={{ 
                            padding: '12px 8px', 
                            textAlign: 'left', 
                            fontWeight: 600,
                            color: colors.text
                          }}>
                            Sales Generated
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffPerformance.map((staff, index) => (
                          <tr key={index} style={{ 
                            borderBottom: `1px solid ${colors.muted}`,
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = colors.panel}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.text,
                              fontWeight: 500
                            }}>
                              {staff.name}
                            </td>
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.text
                            }}>
                              {staff.role}
                            </td>
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.text
                            }}>
                              {staff.hours}h
                            </td>
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.accent,
                              fontWeight: 600
                            }}>
                              {staff.efficiency}%
                            </td>
                            <td style={{ 
                              padding: '12px 8px', 
                              color: colors.text,
                              fontWeight: 600
                            }}>
                              ${staff.sales.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}