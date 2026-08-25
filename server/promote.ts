import mongoose from 'mongoose';
import User from './models/User';
import 'dotenv/config';
import { connectDB } from './config/db';

async function run() {
  await connectDB();
  const users = await User.find();
  console.log('USERS:');
  users.forEach(u => console.log(`- ${u.email} | Role: ${u.role}`));
  
  if (users.length > 0) {
    console.log('\nPromoting the first user to Admin...');
    users[0].role = 'Admin';
    await users[0].save();
    console.log(`Successfully promoted ${users[0].email} to Admin.`);
  } else {
    console.log('No users found in DB.');
  }

  mongoose.disconnect();
}

run();
