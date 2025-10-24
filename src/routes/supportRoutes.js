import express from 'express';
import { sendMessage } from '../controllers/supportController.js';

const router = express.Router();

// POST /api/support/message - Send support message
router.post('/message', sendMessage);

export default router;
