import express from 'express';
import {
  submitReview,
  getEmployeeReviews,
  getMyReviews,
  getManagerReviews,
  getAllReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Manager', 'Admin'), submitReview)
  .get(protect, authorize('Admin'), getAllReviews);

router.get('/my-reviews', protect, getMyReviews);
router.get('/manager', protect, authorize('Manager'), getManagerReviews);
router.get('/employee/:employeeId', protect, getEmployeeReviews);

router.route('/:id')
  .put(protect, authorize('Manager', 'Admin'), updateReview)
  .delete(protect, authorize('Manager', 'Admin'), deleteReview);

export default router;
