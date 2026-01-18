import express from 'express';
import { 
  getConnectors,
  connectGoogleDrive,
  connectNotion,
  disconnectConnector,
  syncConnector,
  getOAuthUrl
} from '../controllers/connectorController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getConnectors);
router.get('/oauth/:type', authenticate, getOAuthUrl);
router.post('/google-drive/connect', authenticate, connectGoogleDrive);
router.post('/notion/connect', authenticate, connectNotion);
router.post('/:type/disconnect', authenticate, disconnectConnector);
router.post('/:type/sync', authenticate, syncConnector);

export default router;