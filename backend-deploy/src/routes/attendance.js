const express = require('express');
const router = express.Router();
const { requireAnyAuth } = require('../middleware/auth');
const { prisma } = require('../lib/prisma');

// Get all attendance records (admin and staff can view)
router.get('/', requireAnyAuth(), async (req, res) => {
  try {
    const { date, userId } = req.query;
    
    const where = {};
    if (date) {
      // Validate date input
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Please provide a valid date.' });
      }
      
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }
    if (userId) {
      where.userId = userId;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            timings: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Get attendance by ID
router.get('/:id', requireAnyAuth(), async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            timings: true
          }
        }
      }
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance record' });
  }
});

// Create or update attendance record (admin only)
router.post('/', requireAnyAuth(), async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { userId, date, status, clockIn, clockOut, breaksMin } = req.body;

    // Validate required fields
    if (!userId || !status) {
      return res.status(400).json({ error: 'userId and status are required' });
    }

    // Validate status
    if (!['PRESENT', 'ABSENT', 'HALF_SHIFT', 'LEAVE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be PRESENT, ABSENT, HALF_SHIFT, or LEAVE.' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse date or use current date
    const attendanceDate = date ? new Date(date) : new Date();
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    attendanceDate.setHours(0, 0, 0, 0);
    // Check if attendance record already exists for this user and date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: attendanceDate,
          lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    let attendance;
    if (existingAttendance) {
      // Update existing record
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status,
          clockIn: clockIn !== undefined ? (clockIn ? new Date(clockIn) : null) : undefined,
          clockOut: clockOut !== undefined ? (clockOut ? new Date(clockOut) : null) : undefined,
          breaksMin: breaksMin !== undefined ? parseInt(breaksMin) : undefined
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              phone: true,
              timings: true
            }
          }
        }
      });
    } else {
      // Create new record
      attendance = await prisma.attendance.create({
        data: {
          userId,
          date: attendanceDate,
          status,
          clockIn: clockIn ? new Date(clockIn) : null,
          clockOut: clockOut ? new Date(clockOut) : null,
          breaksMin: breaksMin ? parseInt(breaksMin) : 0
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              phone: true,
              timings: true
            }
          }
        }
      });
    }

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Failed to create attendance record' });
  }
});

// Update attendance record (admin only)
router.put('/:id', requireAnyAuth(), async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;
    const { status, clockIn, clockOut, breaksMin } = req.body;
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (clockIn !== undefined) {
      if (clockIn) {
        const clockInDate = new Date(clockIn);
        if (isNaN(clockInDate.getTime())) {
          return res.status(400).json({ error: 'Invalid clockIn format' });
        }
        updateData.clockIn = clockInDate;
      } else {
        updateData.clockIn = null;
      }
    }
    if (clockOut !== undefined) {
      if (clockOut) {
        const clockOutDate = new Date(clockOut);
        if (isNaN(clockOutDate.getTime())) {
          return res.status(400).json({ error: 'Invalid clockOut format' });
        }
        updateData.clockOut = clockOutDate;
      } else {
        updateData.clockOut = null;
      }
    }
    if (breaksMin !== undefined) {
      const parsed = parseInt(breaksMin);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ error: 'Invalid breaksMin value' });
      }
      updateData.breaksMin = parsed;
    }

    const attendance = await prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            timings: true
          }
        }
      }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.status(500).json({ error: 'Failed to update attendance record' });
  }
});

// Delete attendance record (admin only)
router.delete('/:id', requireAnyAuth(), async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;

    await prisma.attendance.delete({
      where: { id }
    });

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
});

module.exports = router;

