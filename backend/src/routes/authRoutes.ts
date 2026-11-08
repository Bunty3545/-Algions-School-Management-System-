import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateRequest } from '../middleware/validator';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', validateRequest({ body: authController.loginSchema }), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
