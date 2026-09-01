import mongoose from 'mongoose';
import { env, isMongoConfigured } from './env';

export let dbConnected = false;

export const connectDB = async (): Promise<void> => {
  try {
    if (!isMongoConfigured) {
      console.warn('MONGO_URI not set - running in memory mode');
      return;
    }
    await mongoose.connect(env.MONGO_URI);
    dbConnected = true;
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    console.log('Running in memory fallback mode');
    dbConnected = false;
  }
};

export const getDBStatus = () => ({
  connected: dbConnected,
  mongoUri: env.MONGO_URI ? env.MONGO_URI.split('@')[1] || 'configured' : 'not configured',
});
