import express from 'express';
import { sendMessage } from '../controllers/chatController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/message', authenticate, sendMessage);

export default router;