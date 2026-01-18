import express from 'express';
import { 
  getProgress, 
  updateTopicMastery, 
  getRecommendations 
} from '../controllers/progressController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/:userId', authenticate, getProgress);
router.post('/:userId/mastery', authenticate, updateTopicMastery);
router.get('/:userId/recommendations', authenticate, getRecommendations);

export default router;