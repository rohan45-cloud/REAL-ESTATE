import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
    register,
    login,
    getMe,
    updateMe,
    changePassword,
} from '../controllers/authController.js';

const router = Router();

router.post(
    '/register', [
        body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 80 }),
        body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('phone').optional().trim().isLength({ max: 20 }),
        body('role').optional().isIn(['USER', 'OWNER']).withMessage('Invalid role'),
    ],
    validate,
    register
);

router.post(
    '/login', [
        body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    login
);

router.get('/me', protect, getMe);

router.patch(
    '/me',
    protect, [
        body('name').optional().trim().isLength({ min: 2, max: 80 }),
        body('phone').optional().trim().isLength({ max: 20 }),
    ],
    validate,
    updateMe
);

router.patch(
    '/change-password',
    protect, [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    ],
    validate,
    changePassword
);

export default router;