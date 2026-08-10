import express = require('express');
import type { Request, Response } from 'express';
import morgan = require('morgan');
import cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Interfaces
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
}

// In-memory array
let tasks: Task[] = [];

// Health route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// GET /api/tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  res.status(200).json(tasks);
});

// POST /api/tasks
app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, description, status, priority, due_date } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask: Task = {
    id: uuidv4(),
    title,
    description: description || '',
    status: status || 'To Do',
    priority: priority || 'Medium',
    due_date
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === id);
  const existingTask = tasks[taskIndex];
  
  if (taskIndex === -1 || !existingTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const updatedTask: Task = {
    ...existingTask,
    title: title !== undefined ? title : existingTask.title,
    description: description !== undefined ? description : existingTask.description,
    status: status !== undefined ? status : existingTask.status,
    priority: priority !== undefined ? priority : existingTask.priority,
    due_date: due_date !== undefined ? due_date : existingTask.due_date,
  };

  tasks[taskIndex] = updatedTask;
  res.status(200).json(updatedTask);
});


app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Boot server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
