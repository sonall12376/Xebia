import express from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getTeamAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/status', protect, getTodayStatus);
router.get('/my-history', protect, getMyAttendance);
router.get('/team', protect, authorize('Admin', 'Manager'), getTeamAttendance);

export default router;
