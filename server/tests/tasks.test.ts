import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from '@jest/globals';
import app from '../app';
import Task from '../models/Task';
import Project from '../models/Project';

let mongoServer: MongoMemoryServer;
let authToken: string;
let projectId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Register a user and capture the token
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Task User', email: 'taskuser@test.com', password: 'password123' });
  authToken = res.body.data.token;

  // Create a real project to associate tasks with
  const project = await Project.create({ name: 'Test Project', status: 'Active' });
  if (!project) {
    throw new Error('Failed to create test project');
  }
  projectId = (project._id as mongoose.Types.ObjectId).toString();
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Task.deleteMany({});
});

// ─────────────────────────────────────────────
// HAPPY PATHS
// ─────────────────────────────────────────────

describe('Tasks API', () => {
  describe('POST /api/tasks', () => {
    it('creates a task and returns 201', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Task', project_id: projectId });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('New Task');
      expect(res.body.data.status).toBe('To Do');
      expect(res.body.data.priority).toBe('Medium');
    });

    it('returns 401 when no auth token is provided', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'No Auth', project_id: projectId });

      expect(res.status).toBe(401);
    });

    it('returns 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ project_id: projectId });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    it('returns all tasks', async () => {
      await Task.create({ title: 'Task A', project_id: projectId });
      await Task.create({ title: 'Task B', project_id: projectId });

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('returns empty array when no tasks exist', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('updates a task title', async () => {
      const task = await Task.create({ title: 'Old Title', project_id: projectId });
      if (!task) {
        throw new Error('Failed to create task');
      }

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Title' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('New Title');
    });

    it('updates task status', async () => {
      const task = await Task.create({ title: 'Task', project_id: projectId });
      if (!task) {
        throw new Error('Failed to create task');
      }

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Done' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Done');
    });

    it('returns 400 for a malformed MongoDB ObjectId', async () => {
      const res = await request(app)
        .put('/api/tasks/invalid-id-format')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('deletes a task and returns 200', async () => {
      const task = await Task.create({ title: 'Delete Me', project_id: projectId });
      if (!task) {
        throw new Error('Failed to create task');
      }
      const taskId = (task._id as mongoose.Types.ObjectId).toString();

      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      const deletedTask = await Task.findById(taskId);
      expect(deletedTask).toBeNull();
    });

    it('returns 404 when task does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
