import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app';
import User from '../models/User';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from '@jest/globals';

let mongoServer: MongoMemoryServer;

// Increase timeout for MongoMemoryServer binary download

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

// ─────────────────────────────────────────────
// HAPPY PATHS
// ─────────────────────────────────────────────

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe('alice@test.com');
      expect(res.body.data.user.role).toBe('Member');
      expect(res.body.data.token).toBeDefined();

      const inDb = await User.findOne({ email: 'alice@test.com' } as any);
      expect(inDb).not.toBeNull();
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'noname@test.com', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice', email: 'not-an-email', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice', email: 'alice@test.com', password: 'abc' });

      expect(res.status).toBe(400);
    });
  });

  // ─── Duplicate email ───
  describe('POST /api/auth/register – duplicate', () => {
    it('returns 400 when email is already taken', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice2', email: 'alice@test.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/exists|Duplicate/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Bob', email: 'bob@test.com', password: 'correctpass' });
    });

    it('logs in with correct credentials and returns token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bob@test.com', password: 'correctpass' });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('bob@test.com');
    });

    it('returns 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bob@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid/i);
    });

    it('returns 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid/i);
    });
  });
});
