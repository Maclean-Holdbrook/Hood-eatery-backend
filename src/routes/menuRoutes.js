import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Category routes
router.get('/categories', getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);
router.put('/categories/:id', protect, authorize('admin'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

// Menu item routes
router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItem);
router.post('/items', protect, authorize('admin'), upload.single('image'), createMenuItem);
router.put('/items/:id', protect, authorize('admin'), upload.single('image'), updateMenuItem);
router.delete('/items/:id', protect, authorize('admin'), deleteMenuItem);

export default router;
