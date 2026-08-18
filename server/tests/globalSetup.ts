import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Runs once before all test suites
export const setup = async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env['MONGO_TEST_URI'] = mongoServer.getUri();
};

export const teardown = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};
