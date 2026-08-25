import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate';
import { register, login, getUsers, createUser } from '../controllers/auth';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/users', requireAuth, getUsers);

router.post(
  '/users',
  requireAuth,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['Admin', 'Member']).withMessage('Role must be Admin or Member'),
    validateRequest
  ],
  createUser
);

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  login
);

export default router;
