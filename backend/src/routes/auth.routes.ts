import { Router } from 'express';
import { userSignIn, adminSignIn, getMe } from '../controllers/auth.controller';
import { verifyAuth } from '../middlewares/auth';

const router = Router();

// Student sign in / sync
router.post('/user/signin', verifyAuth, userSignIn);

// Admin sign in (strictly checks email against ADMIN_EMAILS in .env)
router.post('/admin/signin', verifyAuth, adminSignIn);

// Current user profile
router.get('/me', verifyAuth, getMe);

export default router;
