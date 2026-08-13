import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projects';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getProjects);

router.post(
  '/',
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Project name is required').trim().escape(),
    body('status').optional().trim().escape(),
    validateRequest
  ],
  createProject
);

router.put(
  '/:id',
  requireAdmin,
  [
    body('name').optional().notEmpty().withMessage('Project name cannot be empty').trim().escape(),
    body('status').optional().trim().escape(),
    validateRequest
  ],
  updateProject
);

router.delete('/:id', requireAdmin, deleteProject);

export default router;
