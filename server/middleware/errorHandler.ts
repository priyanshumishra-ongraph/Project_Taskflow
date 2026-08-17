import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack || err);

  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found or invalid ID format';
    status = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const values = Object.values(err.errors).map((val: any) => val.message);
    message = values.join(', ');
    status = 400;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    status = 400;
  }

  res.status(status).json({ error: message });
};
