import express from 'express';
import { 
  getQuizzes,
  getQuizById,
  createQuiz,
  startQuizAttempt,
  submitQuizAnswer,
  finishQuizAttempt,
  deleteQuiz
} from '../controllers/quizController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getQuizzes);
router.get('/:id', authenticate, getQuizById);
router.post('/', authenticate, createQuiz);
router.post('/:id/start', authenticate, startQuizAttempt);
router.post('/:id/answer', authenticate, submitQuizAnswer);
router.post('/:id/finish', authenticate, finishQuizAttempt);
router.delete('/:id', authenticate, deleteQuiz);

export default router;