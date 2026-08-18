import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task';

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await Task.find();
    const formattedTasks = tasks.map(t => {
      const obj = t.toObject();
      return { ...obj, id: obj._id };
    });
    res.status(200).json({ data: formattedTasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, priority, due_date, project_id, assignee_ids, subtasks, comments } = req.body;
    
    // Validation is handled by express-validator middleware

    const newTask = await Task.create({
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      due_date,
      project_id,
      assignee_ids,
      subtasks,
      comments,
      creator_id: (req as any).user?.id
    });

    const obj = newTask.toObject();
    res.status(201).json({ data: { ...obj, id: obj._id } });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const updatedTask = await (Task as any).findByIdAndUpdate(
      id,
      { $set: req.body as any },
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const obj = updatedTask.toObject();
    res.status(200).json({ data: { ...obj, id: obj._id } });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const deletedTask = await (Task as any).findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ data: { message: 'Task deleted successfully' } });
  } catch (error) {
    next(error);
  }
};
