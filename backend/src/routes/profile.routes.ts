import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  updateCognitivePreferences 
} from '../controllers/profileController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/:userId', authenticate, getProfile);
router.put('/:userId', authenticate, updateProfile);
router.put('/:userId/cognitive', authenticate, updateCognitivePreferences);

export default router;
