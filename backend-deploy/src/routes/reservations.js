const express = require('express');
const { requireAnyAuth } = require('../middleware/auth');
const router = express.Router();

// Mock data for development
const mockReservations = [
  {
    id: '1',
    tableNumber: 'A1',
    floor: 1,
    customer: {
      id: '1', // This will be replaced with actual user ID when created
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    },
    paxNumber: 4,
    reservationDate: '2025-10-18',
    startTime: '12:00',
    endTime: '14:00',
    depositFee: 50,
    status: 'CONFIRMED',
    paymentMethod: 'CASH',
    specialRequests: 'Window seat preferred',
    customerTitle: 'Mr'
  },
  {
    id: '2',
    tableNumber: 'A2',
    floor: 1,
    customer: {
      id: '2', // This will be replaced with actual user ID when created
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891'
    },
    paxNumber: 2,
    reservationDate: '2025-10-18',
    startTime: '18:00',
    endTime: '20:00',
    depositFee: 30,
    status: 'PENDING',
    paymentMethod: 'CREDIT_CARD',
    specialRequests: '',
    customerTitle: 'Ms'
  },
  {
    id: '3',
    tableNumber: 'A3',
    floor: 1,
    customer: {
      id: '3', // This will be replaced with actual user ID when created
      name: 'AVENGE Faller',
      email: 'eesaangali@gmail.com',
      phone: '09908518193'
    },
    paxNumber: 2,
    reservationDate: '2025-10-18',
    startTime: '12:00',
    endTime: '14:00',
    depositFee: 0,
    status: 'PENDING',
    paymentMethod: 'CASH',
    specialRequests: '',
    customerTitle: 'Mr'
  }
];

// Get all reservations
router.get('/', async (req, res) => {
  try {
    // Disable caching to ensure real-time updates
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json(mockReservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Get reservations by date and floor
router.get('/by-date-floor', async (req, res) => {
  try {
    // Disable caching to ensure real-time updates
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    const { date, floor } = req.query;
    
    if (!date || !floor) {
      return res.status(400).json({ error: 'Date and floor are required' });
    }

    const filteredReservations = mockReservations.filter(reservation => 
      reservation.reservationDate === date && reservation.floor === parseInt(floor)
    );

    res.json(filteredReservations);
  } catch (error) {
    console.error('Error fetching reservations by date and floor:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Create new reservation
router.post('/', requireAnyAuth(), async (req, res) => {
  try {
    const {
      tableNumber,
      floor,
      customerName,
      customerEmail,
      customerPhone,
      customerTitle,
      paxNumber,
      reservationDate,
      startTime,
      endTime,
      depositFee,
      status,
      paymentMethod,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!tableNumber || !floor || !customerName || !reservationDate || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for table conflicts
    const conflictingReservation = mockReservations.find(reservation => 
      reservation.tableNumber === tableNumber &&
      reservation.floor === parseInt(floor) &&
      reservation.reservationDate === reservationDate &&
      reservation.status !== 'CANCELLED' &&
      (
        (reservation.startTime <= startTime && reservation.endTime > startTime) ||
        (reservation.startTime < endTime && reservation.endTime >= endTime) ||
        (reservation.startTime >= startTime && reservation.endTime <= endTime)
      )
    );

    if (conflictingReservation) {
      return res.status(409).json({ 
        error: 'Table is already booked for this time slot',
        conflictingReservation: {
          id: conflictingReservation.id,
          startTime: conflictingReservation.startTime,
          endTime: conflictingReservation.endTime
        }
      });
    }

    // Create new reservation
    const newReservation = {
      id: (mockReservations.length + 1).toString(),
      tableNumber,
      floor: parseInt(floor),
      customer: {
        id: req.user.id, // Use actual user ID from token
        name: customerName,
        email: customerEmail || `temp_${Date.now()}@example.com`,
        phone: customerPhone || '000-000-0000'
      },
      paxNumber: parseInt(paxNumber),
      reservationDate,
      startTime,
      endTime,
      depositFee: parseFloat(depositFee) || 0,
      status: status || 'PENDING',
      paymentMethod: paymentMethod || 'CASH',
      specialRequests: specialRequests || '',
      customerTitle: customerTitle || 'Mr'
    };

    mockReservations.push(newReservation);

    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Update reservation
router.put('/:id', requireAnyAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const reservationIndex = mockReservations.findIndex(r => r.id === id);
    if (reservationIndex === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check if user can edit this reservation
    const reservation = mockReservations[reservationIndex];
    if (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF' && reservation.customer.id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own reservations' });
    }

    // Update the reservation with proper customer data structure
    const existingReservation = mockReservations[reservationIndex];
    const updatedReservation = {
      ...existingReservation,
      ...updateData,
      // Ensure customer object is properly updated
      customer: {
        ...existingReservation.customer,
        name: updateData.customerName || existingReservation.customer.name,
        email: updateData.customerEmail || existingReservation.customer.email,
        phone: updateData.customerPhone || existingReservation.customer.phone,
        title: updateData.customerTitle || existingReservation.customer.title
      }
    };

    mockReservations[reservationIndex] = updatedReservation;

    console.log('Updated reservation in backend:', updatedReservation);
    res.json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

// Delete reservation
router.delete('/:id', requireAnyAuth(), async (req, res) => {
  try {
    const { id } = req.params;

    const reservationIndex = mockReservations.findIndex(r => r.id === id);
    if (reservationIndex === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check if user can delete this reservation
    const reservation = mockReservations[reservationIndex];
    if (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF' && reservation.customer.id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own reservations' });
    }

    mockReservations.splice(reservationIndex, 1);

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

// Get available tables for a specific time slot
router.get('/available-tables', async (req, res) => {
  try {
    const { date, startTime, endTime, floor } = req.query;

    if (!date || !startTime || !endTime || !floor) {
      return res.status(400).json({ error: 'Date, startTime, endTime, and floor are required' });
    }

    // Get all tables for the floor
    const floorTables = getFloorTables(parseInt(floor));
    
    // Get booked tables for the time slot
    const bookedTables = mockReservations.filter(reservation => 
      reservation.floor === parseInt(floor) &&
      reservation.reservationDate === date &&
      reservation.status !== 'CANCELLED' &&
      (
        (reservation.startTime <= startTime && reservation.endTime > startTime) ||
        (reservation.startTime < endTime && reservation.endTime >= endTime) ||
        (reservation.startTime >= startTime && reservation.endTime <= endTime)
      )
    );

    const bookedTableNumbers = bookedTables.map(r => r.tableNumber);
    const availableTables = floorTables.filter(table => !bookedTableNumbers.includes(table.number));

    res.json(availableTables);
  } catch (error) {
    console.error('Error fetching available tables:', error);
    res.status(500).json({ error: 'Failed to fetch available tables' });
  }
});

// Helper function to get floor tables
function getFloorTables(floor) {
  const floorConfigs = {
    1: [
      { number: 'A1', capacity: 4, type: 'Standard' },
      { number: 'A2', capacity: 2, type: 'Standard' },
      { number: 'A3', capacity: 6, type: 'Family' },
      { number: 'A4', capacity: 4, type: 'Standard' },
      { number: 'A5', capacity: 2, type: 'Standard' },
      { number: 'A6', capacity: 8, type: 'Large' },
      { number: 'A7', capacity: 4, type: 'Standard' },
      { number: 'A8', capacity: 2, type: 'Standard' }
    ],
    2: [
      { number: 'B1', capacity: 4, type: 'Standard' },
      { number: 'B2', capacity: 6, type: 'Family' },
      { number: 'B3', capacity: 2, type: 'Standard' },
      { number: 'B4', capacity: 4, type: 'Standard' },
      { number: 'B5', capacity: 8, type: 'Large' },
      { number: 'B6', capacity: 4, type: 'Standard' }
    ],
    3: [
      { number: 'C1', capacity: 6, type: 'Family' },
      { number: 'C2', capacity: 4, type: 'Standard' },
      { number: 'C3', capacity: 2, type: 'Standard' },
      { number: 'C4', capacity: 8, type: 'Large' }
    ]
  };

  return floorConfigs[floor] || [];
}

module.exports = router;
