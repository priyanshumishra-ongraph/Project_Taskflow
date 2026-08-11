import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasks';

const router = Router();

router.get('/', getTasks);

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required').trim().escape(),
    body('status').optional().trim().escape(),
    body('priority').optional().trim().escape(),
    validateRequest
  ],
  createTask
);

router.put(
  '/:id',
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty').trim().escape(),
    body('status').optional().trim().escape(),
    body('priority').optional().trim().escape(),
    validateRequest
  ],
  updateTask
);

router.delete('/:id', deleteTask);

export default router;
