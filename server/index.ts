import 'dotenv/config';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';

import taskRoutes from "./routes/tasks";
import projectRoutes from "./routes/projects";

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
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);

// Boot server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
