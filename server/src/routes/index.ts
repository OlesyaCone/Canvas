import { Router } from 'express';
import { register, login } from '../controllers/auth/register';
import { refresh, logout, verifyEmail } from '../controllers/auth/tokens';
import { protect } from '../middleware/auth';
import passport from '../config/passport';
import { googleCallback } from '../controllers/auth/google';
import { getProfile, updateProfile } from '../controllers/user';
import { uploadAvatar, upload, getFile } from '../controllers/upload';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), googleCallback);
router.get('/verify/:token', verifyEmail);

router.patch('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/profile', protect, getProfile);
router.get('/uploads/*', getFile);

export default router;