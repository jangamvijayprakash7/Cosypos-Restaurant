import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Users, Plus, ChevronRight, User, CreditCard } from 'lucide-react';
import { useUser } from './UserContext';
import { getReservationsByDateFloor, createReservation, updateReservation, deleteReservation, getAvailableTables } from '../utils/api';
import realtimeSync from '../utils/realtimeSync';
import Sidebar from './Sidebar.jsx'
import HeaderBar from './HeaderBar.jsx'

const colors = { 
  bg: '#111315', 
  text: '#FFFFFF', 
  panel: '#292C2D',
  accent: '#FAC1D9',
  muted: '#777979',
  gridLine: '#3D4142'
}

// Floor configurations
const floorConfigs = {
  1: {
    name: '1st Floor',
    tables: [
      { number: 'A1', capacity: 4, type: 'Standard' },
      { number: 'A2', capacity: 2, type: 'Standard' },
      { number: 'A3', capacity: 6, type: 'Family' },
      { number: 'A4', capacity: 4, type: 'Standard' },
      { number: 'A5', capacity: 2, type: 'Standard' },
      { number: 'A6', capacity: 8, type: 'Large' },
      { number: 'A7', capacity: 4, type: 'Standard' },
      { number: 'A8', capacity: 2, type: 'Standard' }
    ]
  },
  2: {
    name: '2nd Floor',
    tables: [
      { number: 'B1', capacity: 4, type: 'Standard' },
      { number: 'B2', capacity: 6, type: 'Family' },
      { number: 'B3', capacity: 2, type: 'Standard' },
      { number: 'B4', capacity: 4, type: 'Standard' },
      { number: 'B5', capacity: 8, type: 'Large' },
      { number: 'B6', capacity: 4, type: 'Standard' }
    ]
  },
  3: {
    name: '3rd Floor',
    tables: [
      { number: 'C1', capacity: 6, type: 'Family' },
      { number: 'C2', capacity: 4, type: 'Standard' },
      { number: 'C3', capacity: 2, type: 'Standard' },
      { number: 'C4', capacity: 8, type: 'Large' }
    ]
  }
};

const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export default function Reservation() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);
  const [isReservationDetailsOpen, setIsReservationDetailsOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null, title: '' });
  
  // Modal form states
  const [formData, setFormData] = useState({
    tableNumber: '',
    floor: selectedFloor,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerTitle: 'Mr',
    paxNumber: 2,
    reservationDate: selectedDate,
    startTime: '12:00',
    endTime: '14:00',
    depositFee: 0,
    status: 'PENDING',
    paymentMethod: 'CASH',
    specialRequests: ''
  });

  // Edit form data state
  const [editFormData, setEditFormData] = useState({
    tableNumber: '',
    floor: 1,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerTitle: 'Mr',
    paxNumber: 2,
    reservationDate: '',
    startTime: '',
    endTime: '',
    depositFee: 0,
    status: 'PENDING',
    paymentMethod: 'CASH',
    specialRequests: ''
  });
  
  // Dropdown states
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTitleDropdownOpen, setIsTitleDropdownOpen] = useState(false);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Confirmation dialog function
  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ show: true, title, message, onConfirm });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, message: '', onConfirm: null, title: '' });
  };

  // Fetch reservations when date or floor changes
  useEffect(() => {
    fetchReservations();
    
    // Initialize real-time synchronization
    realtimeSync.initialize();
  }, [selectedDate, selectedFloor]);

  // Add real-time listeners for Reservation page
  useEffect(() => {
    // Listen for real-time refresh events
    const handleRealtimeRefresh = async () => {
      console.log('🔄 Reservation page real-time refresh triggered');
      try {
        await fetchReservations();
      } catch (error) {
        console.error('Error refreshing reservation data:', error);
      }
    };
    
    window.addEventListener('realtime-refresh', handleRealtimeRefresh);
    
    return () => {
      window.removeEventListener('realtime-refresh', handleRealtimeRefresh);
    };
  }, []);


  // Update form data when floor changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, floor: selectedFloor }));
  }, [selectedFloor]);

  // Initialize edit form data when modal first opens (not on every change)
  useEffect(() => {
    if (isReservationDetailsOpen && selectedReservation && !isEditMode) {
      console.log('Initializing edit form data:', selectedReservation);
      setEditFormData({
        tableNumber: selectedReservation.tableNumber,
        floor: selectedReservation.floor,
        customerName: selectedReservation.customer?.name || selectedReservation.customerName || '',
        customerEmail: selectedReservation.customer?.email || selectedReservation.customerEmail || '',
        customerPhone: selectedReservation.customer?.phone || selectedReservation.customerPhone || '',
        customerTitle: selectedReservation.customer?.title || selectedReservation.customerTitle || 'Mr',
        paxNumber: selectedReservation.paxNumber,
        reservationDate: selectedReservation.reservationDate,
        startTime: selectedReservation.startTime,
        endTime: selectedReservation.endTime,
        depositFee: selectedReservation.depositFee || 0,
        status: selectedReservation.status,
        paymentMethod: selectedReservation.paymentMethod || 'CASH',
        specialRequests: selectedReservation.specialRequests || ''
      });
    }
  }, [isReservationDetailsOpen, selectedReservation?.id]);

  // Fetch available tables when modal opens
  useEffect(() => {
    if (isAddReservationOpen) {
      getAvailableTablesForTimeSlot(formData.startTime, formData.endTime);
    }
  }, [isAddReservationOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsTableDropdownOpen(false);
        setIsStatusDropdownOpen(false);
        setIsTitleDropdownOpen(false);
        setIsPaymentDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      console.log('Fetching reservations for date:', selectedDate, 'floor:', selectedFloor);
      
      const data = await getReservationsByDateFloor(selectedDate, selectedFloor);
      console.log('Fetched reservations:', data);
      setReservations(data);
      
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showToast('Failed to fetch reservations', 'error');
    } finally {
      setLoading(false);
    }
  };


  const getAvailableTablesForTimeSlot = async (startTime, endTime) => {
    try {
      const tables = await getAvailableTables(selectedDate, startTime, endTime, selectedFloor);
      setAvailableTables(tables);
    } catch (error) {
      console.error('Error fetching available tables:', error);
      showToast('Failed to fetch available tables', 'error');
    }
  };

  const handleTimeChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'startTime' || field === 'endTime') {
      const startTime = field === 'startTime' ? value : formData.startTime;
      const endTime = field === 'endTime' ? value : formData.endTime;
      if (startTime && endTime) {
        getAvailableTablesForTimeSlot(startTime, endTime);
      }
    }
  };

  const handleSaveReservation = async () => {
    // Validate required fields
    if (!formData.tableNumber) {
      showToast('Please select a table', 'error');
      return;
    }
    if (!formData.customerName) {
      showToast('Please enter customer name', 'error');
      return;
    }
    if (!formData.customerPhone) {
      showToast('Please enter customer phone number', 'error');
      return;
    }

    try {
      setLoading(true);
      await createReservation(formData);
      showToast('Reservation created successfully!', 'success');
      setIsAddReservationOpen(false);
      fetchReservations();
      resetForm();
    } catch (error) {
      console.error('Error creating reservation:', error);
      showToast(error.message || 'Failed to create reservation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tableNumber: '',
      floor: selectedFloor,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerTitle: 'Mr',
      paxNumber: 2,
      reservationDate: selectedDate,
      startTime: '12:00',
      endTime: '14:00',
      depositFee: 0,
      status: 'PENDING',
      paymentMethod: 'CASH',
      specialRequests: ''
    });
  };

  // Handle reservation click to open details modal
  const handleReservationClick = (reservation) => {
    console.log('Reservation clicked:', reservation);
    setSelectedReservation(reservation);
    setIsReservationDetailsOpen(true);
    setIsEditMode(false);
    
    // Populate edit form with reservation data
    const formData = {
      tableNumber: reservation.tableNumber,
      floor: reservation.floor,
      customerName: reservation.customer?.name || reservation.customerName || '',
      customerEmail: reservation.customer?.email || reservation.customerEmail || '',
      customerPhone: reservation.customer?.phone || reservation.customerPhone || '',
      customerTitle: reservation.customer?.title || reservation.customerTitle || 'Mr',
      paxNumber: reservation.paxNumber,
      reservationDate: reservation.reservationDate,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      depositFee: reservation.depositFee || 0,
      status: reservation.status,
      paymentMethod: reservation.paymentMethod || 'CASH',
      specialRequests: reservation.specialRequests || ''
    };
    
    console.log('Setting edit form data:', formData);
    setEditFormData(formData);
  };

  // Handle edit reservation
  const handleEditReservation = async () => {
    try {
      setLoading(true);
      console.log('Updating reservation:', selectedReservation.id);
      
      // Structure the data properly for the API
      const updateData = {
        tableNumber: editFormData.tableNumber,
        floor: parseInt(editFormData.floor) || 1,
        customerName: editFormData.customerName,
        customerEmail: editFormData.customerEmail,
        customerPhone: editFormData.customerPhone,
        customerTitle: editFormData.customerTitle,
        paxNumber: parseInt(editFormData.paxNumber) || 1,
        reservationDate: editFormData.reservationDate,
        startTime: editFormData.startTime,
        endTime: editFormData.endTime,
        depositFee: parseFloat(editFormData.depositFee) || 0,
        status: editFormData.status,
        paymentMethod: editFormData.paymentMethod,
        specialRequests: editFormData.specialRequests
      };
      
      console.log('Sending update data:', updateData);
      
      // Update via API
      const result = await updateReservation(selectedReservation.id, updateData);
      console.log('Update result:', result);
      
      // Update local state immediately with the new data
      const updatedReservation = {
        ...selectedReservation,
        tableNumber: editFormData.tableNumber,
        floor: parseInt(editFormData.floor) || 1,
        customer: {
          ...selectedReservation.customer,
          name: editFormData.customerName,
          email: editFormData.customerEmail,
          phone: editFormData.customerPhone,
          title: editFormData.customerTitle
        },
        paxNumber: parseInt(editFormData.paxNumber) || 1,
        reservationDate: editFormData.reservationDate,
        startTime: editFormData.startTime,
        endTime: editFormData.endTime,
        depositFee: parseFloat(editFormData.depositFee) || 0,
        status: editFormData.status,
        paymentMethod: editFormData.paymentMethod,
        specialRequests: editFormData.specialRequests,
        customerTitle: editFormData.customerTitle,
        updatedAt: Date.now() // Add timestamp for force re-render
      };
      
      // Update the reservations list immediately
      setReservations(prev => prev.map(reservation => 
        reservation.id === selectedReservation.id ? updatedReservation : reservation
      ));
      
      // Refetch immediately to ensure data is in sync with database
      await fetchReservations();
      
      // Update the selected reservation for the modal
      setSelectedReservation(updatedReservation);
      
      // Also update the edit form data to reflect the changes
      setEditFormData({
        tableNumber: editFormData.tableNumber,
        floor: parseInt(editFormData.floor) || 1,
        customerName: editFormData.customerName,
        customerEmail: editFormData.customerEmail,
        customerPhone: editFormData.customerPhone,
        customerTitle: editFormData.customerTitle,
        paxNumber: parseInt(editFormData.paxNumber) || 1,
        reservationDate: editFormData.reservationDate,
        startTime: editFormData.startTime,
        endTime: editFormData.endTime,
        depositFee: parseFloat(editFormData.depositFee) || 0,
        status: editFormData.status,
        paymentMethod: editFormData.paymentMethod,
        specialRequests: editFormData.specialRequests
      });
      
      console.log('Updated selectedReservation:', updatedReservation);
      console.log('Updated editFormData:', editFormData);
      
      showToast('Reservation updated successfully!', 'success');
      setIsEditMode(false);
      
      // Refresh data from backend in background
      setTimeout(() => {
        fetchReservations();
      }, 500);
      
    } catch (error) {
      console.error('Error updating reservation:', error);
      showToast(error.message || 'Failed to update reservation', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete reservation
  const handleDeleteReservation = () => {
    showConfirmDialog(
      'Delete Reservation',
      'Are you sure you want to delete this reservation? This action cannot be undone.',
      async () => {
        try {
          setLoading(true);
          console.log('Deleting reservation:', selectedReservation.id);
          
          // Delete via API
          const result = await deleteReservation(selectedReservation.id);
          console.log('Delete result:', result);
          
          // Update local state immediately
          setReservations(prev => prev.filter(reservation => reservation.id !== selectedReservation.id));
          
          showToast('Reservation deleted successfully!', 'success');
          setIsReservationDetailsOpen(false);
          setIsEditMode(false);
          closeConfirmDialog();
          
          // Refetch immediately to ensure data is in sync with database
          await fetchReservations();
          
        } catch (error) {
          console.error('Error deleting reservation:', error);
          showToast(error.message || 'Failed to delete reservation', 'error');
          closeConfirmDialog();
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Check if user can edit/delete reservation
  const canEditReservation = (reservation) => {
    if (user?.role === 'ADMIN' || user?.role === 'STAFF') {
      return true; // Admin and staff can edit all reservations
    }
    if (user?.role === 'USER') {
      return reservation.customer?.id === user?.id; // Users can only edit their own reservations
    }
    return false;
  };

  // Get background color based on reservation status
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          background: colors.accent, // Pink
          color: '#000000',
          border: 'none'
        };
      case 'PENDING':
        return {
          background: '#FFA500', // Orange
          color: '#000000',
          border: 'none'
        };
      case 'COMPLETED':
        return {
          background: '#4CAF50', // Green
          color: '#FFFFFF',
          border: 'none'
        };
      case 'CANCELLED':
        return {
          background: '#FF6B6B', // Red
          color: '#FFFFFF',
          border: 'none'
        };
      default:
        return {
          background: colors.panel,
          color: colors.text,
          border: `1px solid ${colors.gridLine}`
        };
    }
  };

  const getReservationStyle = (reservation) => {
    const startIndex = timeSlots.indexOf(reservation.startTime);
    const endIndex = timeSlots.indexOf(reservation.endTime);
    const duration = endIndex - startIndex;
    
    // Account for table label width (80px) + grid cell offset
    const tableLabelWidth = 80;
    const leftOffset = 4; // Small gap from grid line
    
    const statusColors = getStatusColor(reservation.status);
    
    return {
      position: 'absolute',
      left: `${tableLabelWidth + (startIndex * 100) + leftOffset}px`,
      top: '8px',
      width: `${duration * 100 - 8}px`,
      height: '44px',
      background: statusColors.background,
      borderRadius: '4px',
      padding: '6px 8px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      color: statusColors.color,
      fontSize: '10px',
      fontWeight: '500',
      zIndex: 2,
      border: statusColors.border,
      cursor: 'pointer',
      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      boxSizing: 'border-box',
      overflow: 'hidden',
      pointerEvents: 'auto',
      maxWidth: `${duration * 100 - 8}px`,
      minWidth: 0
    };
  };

  const getTableRowStyle = (tableName) => ({
    display: 'flex',
    alignItems: 'center',
    height: '60px',
    borderBottom: `1px solid ${colors.gridLine}`,
    position: 'relative',
    overflow: 'hidden'
  });

  const getTableLabelStyle = () => ({
    width: '80px',
    height: '100%',
    paddingLeft: '16px',
    fontSize: '14px',
    fontWeight: '500',
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
    borderRight: `1px solid ${colors.gridLine}`
  });

  const getGridCellStyle = () => ({
    width: '100px',
    height: '60px',
    borderRight: `1px solid ${colors.gridLine}`,
    position: 'relative'
  });

  const currentFloorTables = floorConfigs[selectedFloor]?.tables || [];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg, 
      color: colors.text,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none'
    }}>
      <style>
        {`
          * {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
          input, textarea, select {
            user-select: text !important;
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
          }
        `}
      </style>
      <div style={{ 
        width: '100%', 
        maxWidth: '100vw',
        margin: '0 auto', 
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}>
        <Sidebar />
        <HeaderBar title="Reservation" showBackButton={true} right={(
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

            <div style={{ 
              width: 0,
              height: 22.29,
              border: '0.742918px solid #FFFFFF',
              margin: '0 8px'
            }} />

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
                  e.target.src = "/profile img icon.jpg";
                }}
              />
            </div>
          </>
        )} />

        <main style={{ 
          paddingLeft: 208, 
          paddingRight: 32, 
          paddingTop: 20, 
          paddingBottom: 32,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}>
          {/* Floor Selection Tabs and Action Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px' 
          }}>
            {/* Floor Selection Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.entries(floorConfigs).map(([floorNum, config]) => (
                <button
                  key={floorNum}
                  onClick={() => setSelectedFloor(parseInt(floorNum))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: selectedFloor === parseInt(floorNum) ? colors.accent : colors.panel,
                    color: selectedFloor === parseInt(floorNum) ? '#333333' : colors.text,
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {config.name}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Date Picker */}
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{
                          padding: '8px 16px',
                          background: colors.panel,
                          color: colors.text,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      />

              {/* Add New Reservation Button */}
              <button
                onClick={() => setIsAddReservationOpen(true)}
                style={{
                  padding: '8px 16px',
                  background: colors.accent,
                  color: '#333333',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s ease'
                }}
              >
                <Plus size={16} />
                Add New Reservation
              </button>
            </div>
          </div>

          {/* Time Values Above Table */}
          <div style={{
            display: 'flex',
            marginBottom: '8px',
            marginLeft: '80px'
          }}>
            {timeSlots.map((time) => (
              <div key={time} style={{
                width: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '500',
                color: colors.muted
              }}>
                {time}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ 
            background: colors.bg, 
            borderRadius: '8px', 
            border: `1px solid ${colors.gridLine}`,
            overflow: 'hidden'
          }}>
            {/* Table Rows */}
            {currentFloorTables.map((table) => (
              <div key={table.number} style={getTableRowStyle(table.number)}>
                <div style={getTableLabelStyle()}>
                  {table.number}
                </div>
                <div style={{ display: 'flex', flex: 1 }}>
                  {timeSlots.map((time) => (
                    <div key={time} style={getGridCellStyle()}></div>
                  ))}
                </div>
                
                {/* Reservations for this table */}
                {reservations
                  .filter(reservation => reservation.tableNumber === table.number)
                  .map((reservation) => (
                    <div
                      key={reservation.id}
                      style={getReservationStyle(reservation)}
                      onClick={() => handleReservationClick(reservation)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
                        e.currentTarget.style.zIndex = '3';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.zIndex = '2';
                      }}
                    >
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%'
                      }}>
                        {reservation.customer?.name || 'Unknown'}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        flexShrink: 0
                      }}>
                        <Users size={12} />
                        <span>{reservation.paxNumber.toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </main>

        {/* Add New Reservation Modal */}
        {isAddReservationOpen && (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsAddReservationOpen(false);
              }
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}>
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                right: '32px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '420px',
                height: '90vh',
                background: colors.panel,
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexShrink: 0
              }}>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.text,
                  margin: 0
                }}>
                  Add New Reservation
                </h2>
              <button
                onClick={() => {
                  setIsAddReservationOpen(false);
                  resetForm();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.text,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <ChevronRight size={20} />
              </button>
              </div>

              {/* Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', paddingRight: '8px' }}>
                {/* Reservation Details */}
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: '12px'
                  }}>
                    Reservation Details
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '16px', paddingRight: '8px' }}>
                    {/* Table Selection */}
                    <div className="dropdown-container" style={{ position: 'relative' }}>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Table Number
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div
                          onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            background: colors.bg,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '4px',
                            color: colors.text,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{formData.tableNumber || 'Select Table'}</span>
                          <ChevronDown size={16} color={colors.muted} />
                        </div>
                        {isTableDropdownOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: colors.panel,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            {availableTables.length > 0 ? (
                              availableTables.map((table) => (
                                <div
                                  key={table.number}
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, tableNumber: table.number }));
                                    setIsTableDropdownOpen(false);
                                  }}
                                  style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    color: colors.text,
                                    fontSize: '12px',
                                    transition: 'background 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => e.target.style.background = colors.gridLine}
                                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                  {table.number} ({table.capacity} seats)
                                </div>
                              ))
                            ) : (
                              <div style={{
                                padding: '8px 12px',
                                color: colors.muted,
                                fontSize: '12px',
                                textAlign: 'center'
                              }}>
                                No available tables
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pax Number */}
                    <div>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.paxNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, paxNumber: parseInt(e.target.value) }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Reservation Date
                      </label>
                      <input
                        type="date"
                        value={formData.reservationDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, reservationDate: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    {/* Time Slots */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                          Start Time
                        </label>
                        <select
                          value={formData.startTime}
                          onChange={(e) => handleTimeChange('startTime', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: colors.bg,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '6px',
                            color: colors.text,
                            fontSize: '14px'
                          }}
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                          End Time
                        </label>
                        <select
                          value={formData.endTime}
                          onChange={(e) => handleTimeChange('endTime', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: colors.bg,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '6px',
                            color: colors.text,
                            fontSize: '14px'
                          }}
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Deposit Fee */}
                    <div>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Deposit Fee ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.depositFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, depositFee: parseFloat(e.target.value) || 0 }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      />
                    </div>

                    {/* Status */}
                    <div className="dropdown-container" style={{ position: 'relative' }}>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Status
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div
                          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            background: colors.bg,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '4px',
                            color: colors.text,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{formData.status}</span>
                          <ChevronDown size={16} color={colors.muted} />
                        </div>
                        {isStatusDropdownOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: colors.panel,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            zIndex: 1000
                          }}>
                            {['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((status) => (
                              <div
                                key={status}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, status }));
                                  setIsStatusDropdownOpen(false);
                                }}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  color: colors.text,
                                  fontSize: '12px',
                                  transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.background = colors.gridLine}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                {status}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: '12px'
                  }}>
                    Customer Details
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '16px', paddingRight: '8px' }}>
                    {/* Title */}
                    <div className="dropdown-container" style={{ position: 'relative' }}>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Title
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div
                          onClick={() => setIsTitleDropdownOpen(!isTitleDropdownOpen)}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            background: colors.bg,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '4px',
                            color: colors.text,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{formData.customerTitle}</span>
                          <ChevronDown size={16} color={colors.muted} />
                        </div>
                        {isTitleDropdownOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: colors.panel,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            zIndex: 1000
                          }}>
                            {['Mr', 'Mrs', 'Ms', 'Dr'].map((title) => (
                              <div
                                key={title}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, customerTitle: title }));
                                  setIsTitleDropdownOpen(false);
                                }}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  color: colors.text,
                                  fontSize: '12px',
                                  transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.background = colors.gridLine}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                {title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: '12px'
                  }}>
                    Additional Information
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '16px', paddingRight: '8px' }}>
                    {/* Payment Method */}
                    <div className="dropdown-container" style={{ position: 'relative' }}>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Payment Method
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div
                          onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            background: colors.bg,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <CreditCard size={16} color={colors.muted} />
                          <span style={{ color: colors.text, fontSize: '14px', flex: 1 }}>{formData.paymentMethod}</span>
                          <ChevronDown size={16} color={colors.muted} />
                        </div>
                        {isPaymentDropdownOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: colors.panel,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            zIndex: 1000
                          }}>
                            {['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_PAYMENT', 'BANK_TRANSFER'].map((payment) => (
                              <div
                                key={payment}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, paymentMethod: payment }));
                                  setIsPaymentDropdownOpen(false);
                                }}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  color: colors.text,
                                  fontSize: '12px',
                                  transition: 'background 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                                onMouseEnter={(e) => e.target.style.background = colors.gridLine}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                <CreditCard size={14} color={colors.muted} />
                                {payment.replace('_', ' ')}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label style={{ fontSize: '11px', color: colors.muted, marginBottom: '8px', display: 'block' }}>
                        Special Requests
                      </label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          resize: 'vertical',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                        placeholder="Any special requests or notes..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '12px',
                borderTop: `1px solid ${colors.gridLine}`,
                flexShrink: 0
              }}>
                <button
                  onClick={() => {
                    setIsAddReservationOpen(false);
                    resetForm();
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: colors.text,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    borderRadius: '6px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReservation}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    background: loading ? colors.muted : colors.accent,
                    border: 'none',
                    color: loading ? colors.text : '#333333',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reservation Details Modal */}
        {isReservationDetailsOpen && selectedReservation && (
          <div 
            key={`modal-${selectedReservation.id}-${selectedReservation.updatedAt || Date.now()}`}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3000
            }}>
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                background: colors.panel,
                borderRadius: '12px',
                padding: '24px',
                width: '500px',
                maxHeight: '80vh',
                overflow: 'auto',
                position: 'relative'
              }}>
              
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: `1px solid ${colors.gridLine}`,
                paddingBottom: '16px'
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: colors.text,
                  margin: 0
                }}>
                  Reservation Details
                </h2>
                <button
                  onClick={() => {
                    setIsReservationDetailsOpen(false);
                    setIsEditMode(false);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: colors.muted,
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Reservation Content */}
              <div style={{ marginBottom: '20px' }}>
                {isEditMode ? (
                  // Edit Form
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Customer Name */}
                    <div>
                      <label style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px', display: 'block' }}>
                        Customer Name
                      </label>
                      <input
                        type="text"
                        value={editFormData.customerName}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      />
                    </div>

                    {/* Customer Email */}
                    <div>
                      <label style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px', display: 'block' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={editFormData.customerEmail}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      />
                    </div>

                    {/* Customer Phone */}
                    <div>
                      <label style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px', display: 'block' }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editFormData.customerPhone}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      />
                    </div>

                    {/* Pax Number */}
                    <div>
                      <label style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px', display: 'block' }}>
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={editFormData.paxNumber || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, paxNumber: parseInt(e.target.value) || 1 }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      />
                    </div>

                    {/* Date and Time */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px', display: 'block' }}>
                          Date
                        </label>
                        <input
                          type="date"
                          value={editFormData.reservationDate}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, reservationDate: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: colors.bg,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '6px',
                            color: colors.text,
                            fontSize: '14px',
                            userSelect: 'text',
                            WebkitUserSelect: 'text',
                            MozUserSelect: 'text',
                            msUserSelect: 'text'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px', display: 'block' }}>
                          Start Time
                        </label>
                        <select
                          value={editFormData.startTime}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, startTime: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: colors.bg,
                            border: `1px solid ${colors.gridLine}`,
                            borderRadius: '6px',
                            color: colors.text,
                            fontSize: '14px',
                            cursor: 'pointer',
                            userSelect: 'text',
                            WebkitUserSelect: 'text',
                            MozUserSelect: 'text',
                            msUserSelect: 'text'
                          }}
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px', display: 'block' }}>
                        Status
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          cursor: 'pointer',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px', display: 'block' }}>
                        Special Requests
                      </label>
                      <textarea
                        value={editFormData.specialRequests}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: colors.bg,
                          border: `1px solid ${colors.gridLine}`,
                          borderRadius: '6px',
                          color: colors.text,
                          fontSize: '14px',
                          resize: 'vertical',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text'
                        }}
                        placeholder="Any special requests or notes..."
                      />
                    </div>
                  </div>
                ) : (
                  // View Mode - Show current data (either original or edited)
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.muted, fontSize: '12px' }}>Customer:</span>
                      <span style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
                        {editFormData.customerName || selectedReservation.customer?.name || 'Unknown'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.muted, fontSize: '12px' }}>Email:</span>
                      <span style={{ color: colors.text, fontSize: '14px' }}>
                        {editFormData.customerEmail || selectedReservation.customer?.email || 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.muted, fontSize: '12px' }}>Phone:</span>
                      <span style={{ color: colors.text, fontSize: '14px' }}>
                        {editFormData.customerPhone || selectedReservation.customer?.phone || 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.muted, fontSize: '12px' }}>Table:</span>
                      <span style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
                        {editFormData.tableNumber || selectedReservation.tableNumber}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.muted, fontSize: '12px' }}>Guests:</span>
                      <span style={{ color: colors.text, fontSize: '14px' }}>
                        {editFormData.paxNumber || selectedReservation.paxNumber}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.muted, fontSize: '12px' }}>Date:</span>
                      <span style={{ color: colors.text, fontSize: '14px' }}>
                        {editFormData.reservationDate ? new Date(editFormData.reservationDate).toLocaleDateString() : new Date(selectedReservation.reservationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.muted, fontSize: '12px' }}>Time:</span>
                      <span style={{ color: colors.text, fontSize: '14px' }}>
                        {editFormData.startTime && editFormData.endTime ? `${editFormData.startTime} - ${editFormData.endTime}` : `${selectedReservation.startTime} - ${selectedReservation.endTime}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.muted, fontSize: '12px' }}>Status:</span>
                      <span style={{ 
                        color: (editFormData.status || selectedReservation.status) === 'CONFIRMED' ? colors.accent : colors.text, 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {editFormData.status || selectedReservation.status}
                      </span>
                    </div>
                    {(editFormData.specialRequests || selectedReservation.specialRequests) && (
                      <div style={{ marginTop: '8px' }}>
                        <span style={{ color: colors.muted, fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                          Special Requests:
                        </span>
                        <span style={{ color: colors.text, fontSize: '14px' }}>
                          {editFormData.specialRequests || selectedReservation.specialRequests}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                borderTop: `1px solid ${colors.gridLine}`,
                paddingTop: '16px'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {canEditReservation(selectedReservation) && (
                    <>
                      {isEditMode ? (
                        <>
                          <button
                            onClick={handleEditReservation}
                            disabled={loading}
                            style={{
                              background: colors.accent,
                              color: '#333',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              opacity: loading ? 0.6 : 1
                            }}
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => {
                              console.log('Switching to view mode, current editFormData:', editFormData);
                              setIsEditMode(false);
                            }}
                            style={{
                              background: 'transparent',
                              color: colors.muted,
                              border: `1px solid ${colors.gridLine}`,
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            Preview
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            console.log('Switching to edit mode, current editFormData:', editFormData);
                            setIsEditMode(true);
                          }}
                          style={{
                            background: 'transparent',
                            color: colors.accent,
                            border: `1px solid ${colors.accent}`,
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {canEditReservation(selectedReservation) && (
                    <button
                      onClick={handleDeleteReservation}
                      disabled={loading}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsReservationDetailsOpen(false);
                      setIsEditMode(false);
                    }}
                    style={{
                      background: 'transparent',
                      color: colors.muted,
                      border: `1px solid ${colors.gridLine}`,
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
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
                borderRadius: '12px',
                padding: '24px',
                width: '400px',
                maxWidth: '90%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog Header */}
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: colors.text
              }}>
                {confirmDialog.title}
              </h3>

              {/* Dialog Message */}
              <p style={{
                margin: '0 0 24px 0',
                fontSize: '14px',
                color: colors.muted,
                lineHeight: '1.5'
              }}>
                {confirmDialog.message}
              </p>

              {/* Dialog Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={closeConfirmDialog}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: `1px solid ${colors.line}`,
                    borderRadius: '8px',
                    color: colors.text,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.line
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
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
                    padding: '10px 20px',
                    background: '#DC3545',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(220, 53, 69, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#C82333'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.6)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#DC3545'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.4)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: toast.type === 'success' ? colors.accent : toast.type === 'error' ? '#FF6B6B' : '#FFA500',
            color: toast.type === 'success' ? '#000000' : '#FFFFFF',
            padding: '14px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '250px',
            animation: 'slideInRight 0.3s ease-out'
          }}>
            {/* Icon based on type */}
            <div style={{ 
              fontSize: '18px',
              flexShrink: 0
            }}>
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'info' && 'ℹ'}
            </div>
            <div style={{ flex: 1 }}>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}