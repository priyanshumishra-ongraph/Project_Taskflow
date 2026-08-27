import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import projectRoutes from './routes/projects';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/auth';

// Separate app factory (no app.listen, no connectDB)
// Used by tests so they can manage the DB connection themselves.
const app = express();
app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:4200')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ data: { status: 'OK' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', requireAuth, taskRoutes);
app.use('/api/projects', requireAuth, projectRoutes);

app.use(errorHandler);

export default app;
