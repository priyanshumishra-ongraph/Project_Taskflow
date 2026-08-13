import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error("MONGO_URI is not defined in the environment variables.");
    }

    if (uri.includes('<username>') || uri.includes('<password>')) {
      console.warn("WARNING: Using placeholder MONGO_URI. Please update your .env file with your actual MongoDB Atlas credentials.");
    }

    const conn = await mongoose.connect(uri);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
