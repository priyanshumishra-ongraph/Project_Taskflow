import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projects';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getProjects);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Project name is required').trim().escape(),
    body('status').optional().trim().escape(),
    body('owner_id').optional().trim().escape(),
    validateRequest
  ],
  createProject
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  [
    body('name').optional().notEmpty().withMessage('Project name cannot be empty').trim().escape(),
    body('status').optional().trim().escape(),
    body('owner_id').optional().trim().escape(),
    validateRequest
  ],
  updateProject
);

router.delete('/:id', requireAuth, requireAdmin, deleteProject);

export default router;
