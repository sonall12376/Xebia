import express from 'express';
import {
  getAdminDashboard,
  getManagerDashboard,
  getEmployeeDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, authorize('Admin'), getAdminDashboard);
router.get('/manager', protect, authorize('Manager'), getManagerDashboard);
router.get('/employee', protect, authorize('Employee'), getEmployeeDashboard);

export default router;
