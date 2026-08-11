import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  [key: string]: any;
}

let tasks: Task[] = [];

export const getTasks = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ data: tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body;
    
    // Validation is handled by express-validator middleware

    const newTask: Task = {
      id: crypto.randomUUID(),
      ...req.body,
      title,
      status: req.body.status || 'To Do',
      priority: req.body.priority || 'Medium',
    };

    tasks.push(newTask);
    res.status(201).json({ data: newTask });
  } catch (error) {
    next(error);
  }
};

export const updateTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const taskIndex = tasks.findIndex(t => t.id === id);
    const existingTask = tasks[taskIndex];
    
    if (taskIndex === -1 || !existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask: Task = {
      ...existingTask,
      ...req.body,
      id: existingTask.id // prevent id overwrite
    };

    tasks[taskIndex] = updatedTask;
    res.status(200).json({ data: updatedTask });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    res.status(200).json({ data: { message: 'Task deleted successfully' } });
  } catch (error) {
    next(error);
  }
};
