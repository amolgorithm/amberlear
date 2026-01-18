import express from 'express';
import { sendMessage } from '../controllers/chatController';
import { authenticate } from '../middleware/auth.middleware';
import { getHeyGenToken } from '../controllers/chatController';

const router = express.Router();

router.post('/message', authenticate, sendMessage);
router.post('/token', authenticate, getHeyGenToken); // Frontend calls /api/chat/token

export default router;