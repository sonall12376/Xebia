import express from 'express';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectEmployees,
  getProjectManagers,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('Admin', 'Manager'), createProject);

router.route('/employees')
  .get(protect, authorize('Admin', 'Manager'), getProjectEmployees);

router.route('/managers')
  .get(protect, authorize('Admin', 'Manager'), getProjectManagers);

router.route('/:id')
  .put(protect, authorize('Admin', 'Manager'), updateProject)
  .delete(protect, authorize('Admin', 'Manager'), deleteProject);

export default router;
