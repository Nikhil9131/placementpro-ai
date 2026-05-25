import { Router } from 'express';
import { register, login, logout, refresh, resetPassword } from '../controllers/authController';
import { validate } from '../middlewares/validation';
import { registerSchema, loginSchema } from '../utils/validationSchemas';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/reset-password', resetPassword);

export default router;
