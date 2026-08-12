import 'dotenv/config';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';

import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import projectRoutes from "./routes/projects";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ data: { status: 'OK', timestamp: new Date().toISOString() } });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', requireAuth, taskRoutes);
app.use('/api/projects', requireAuth, projectRoutes);

// Error Handling Middleware (must be after routes)
app.use(errorHandler);

// Boot server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
