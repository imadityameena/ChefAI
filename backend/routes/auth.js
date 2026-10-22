import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/auth.js';
import rateLimit from '../middlewares/rateLimit.js';

const router = express.Router();

// Slow down password guessing: 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many attempts, please try again in a few minutes'
});

// Public routes
router.post('/signup', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post(
    '/reset-password',
    authLimiter,
    authController.requestPasswordReset
);

// Protected routes
router.get(
    '/me',
    authMiddleware,
    authController.getCurrentUser
);

export default router;