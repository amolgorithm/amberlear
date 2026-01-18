import express from 'express';
import { 
  getMaterials,
  getMaterialById,
  uploadMaterial,
  updateMaterialProgress,
  analyzeMaterial,
  generateQuiz,
  deleteMaterial
} from '../controllers/materialController';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', authenticate, getMaterials);
router.get('/:id', authenticate, getMaterialById);
router.post('/upload', authenticate, upload.single('file'), uploadMaterial);
router.put('/:id/progress', authenticate, updateMaterialProgress);
router.post('/:id/analyze', authenticate, analyzeMaterial);
router.post('/:id/quiz', authenticate, generateQuiz);
router.delete('/:id', authenticate, deleteMaterial);

export default router;