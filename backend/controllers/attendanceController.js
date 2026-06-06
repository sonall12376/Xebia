import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// Helper to normalize dates to midnight UTC
const getTodayMidnight = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
};

// @desc    Register a check-in for today
// @route   POST /api/attendance/check-in
// @access  Private
export const checkIn = async (req, res) => {
  try {
    const today = getTodayMidnight();
    const userId = req.user._id;

    // Check if user already checked in today
    const alreadyCheckedIn = await Attendance.findOne({ userId, date: today });
    if (alreadyCheckedIn) {
      return res.status(400).json({ message: 'You have already checked in today.' });
    }

    const log = await Attendance.create({
      userId,
      date: today,
      checkInTime: new Date(),
      checkOutTime: null
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(550).json({ message: error.message });
  }
};

// @desc    Register a check-out for today
// @route   POST /api/attendance/check-out
// @access  Private
export const checkOut = async (req, res) => {
  try {
    const today = getTodayMidnight();
    const userId = req.user._id;

    // Find today's check-in log
    const log = await Attendance.findOne({ userId, date: today });
    if (!log) {
      return res.status(400).json({ message: 'No check-in record found for today. Please clock in first.' });
    }

    if (log.checkOutTime) {
      return res.status(400).json({ message: 'You have already checked out today.' });
    }

    log.checkOutTime = new Date();
    await log.save();

    res.json(log);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's check-in status
// @route   GET /api/attendance/status
// @access  Private
export const getTodayStatus = async (req, res) => {
  try {
    const today = getTodayMidnight();
    const userId = req.user._id;

    const log = await Attendance.findOne({ userId, date: today });
    res.json(log);
  } catch (error) {
    console.error('Fetch status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get personal attendance history list
// @route   GET /api/attendance/my-history
// @access  Private
export const getMyAttendance = async (req, res) => {
  try {
    const logs = await Attendance.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team attendance logs (Managers see direct reports, Admins see all)
// @route   GET /api/attendance/team
// @access  Private (Admin, Manager)
export const getTeamAttendance = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Manager') {
      const directReports = await User.find({ managerId: req.user._id }).select('_id');
      const reportIds = directReports.map(r => r._id);
      query.userId = { $in: reportIds };
    }

    const logs = await Attendance.find(query)
      .populate('userId', 'name email department designation')
      .sort({ date: -1 });

    res.json(logs);
  } catch (error) {
    console.error('Fetch team attendance error:', error);
    res.status(500).json({ message: error.message });
  }
};
