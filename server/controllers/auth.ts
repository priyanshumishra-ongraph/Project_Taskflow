import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Mock user database
let users: any[] = [];

// Initialize with a dummy user
const initUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  users.push({
    id: 'usr_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: hashedPassword,
    role: 'Admin'
  });
};
initUsers();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      role: 'Member'
    };
    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({ data: { user: { id: newUser.id, name, email, role: newUser.role }, token } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ data: { user: { id: user.id, name: user.name, email, role: user.role }, token } });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      password_plain: 'password123' // Mock only, per requirements
    }));
    res.status(200).json({ data: publicUsers });
  } catch (err) {
    next(err);
  }
};
