import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from '@jest/globals';
import app from '../app';
import Project from '../models/Project';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let memberToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Register Admin user (first user is Admin by default)
  const adminRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin User', email: 'admin@test.com', password: 'password123' });
  adminToken = adminRes.body.data.token;

  // Register Member user
  const memberRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Member User', email: 'member@test.com', password: 'password123' });
  memberToken = memberRes.body.data.token;
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Project.deleteMany({});
});

describe('Projects API Authorization', () => {
  it('allows Admin to create, update, and delete projects', async () => {
    // Create
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Admin Project' });
    expect(createRes.status).toBe(201);
    const projectId = createRes.body.data.id;

    // Update
    const updateRes = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Admin Project' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Updated Admin Project');

    // Delete
    const deleteRes = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it('prevents Member from creating, updating, or deleting projects', async () => {
    // Create
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Member Project' });
    expect(createRes.status).toBe(403);

    // Seed a project manually to test update/delete
    const project = await Project.create({ name: 'Target Project', status: 'Active' });

    // Update
    const updateRes = await request(app)
      .put(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Hacked Project' });
    expect(updateRes.status).toBe(403);

    // Delete
    const deleteRes = await request(app)
      .delete(`/api/projects/${project._id}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(deleteRes.status).toBe(403);
  });

  it('allows Member to read projects', async () => {
    await Project.create({ name: 'Public Project', status: 'Active' });

    const getRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.length).toBeGreaterThan(0);
  });
});
