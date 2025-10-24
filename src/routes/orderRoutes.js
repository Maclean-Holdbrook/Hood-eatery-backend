import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  trackOrder,
  updateOrderStatus,
  getMyOrders,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/', protect, authorize('admin'), getOrders);
router.get('/stats', protect, authorize('admin'), getOrderStats);
router.get('/my/orders', protect, getMyOrders);
router.get('/track/:orderNumber', trackOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

export default router;
