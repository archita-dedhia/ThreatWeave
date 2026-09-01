import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: process.env.API_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  MONGO_URI: process.env.MONGO_URI || '',
  CREWAI_BASE_URL: process.env.CREWAI_BASE_URL || '',
  CREWAI_API_TOKEN: process.env.CREWAI_API_TOKEN || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};

export const isCrewAIConfigured = Boolean(env.CREWAI_BASE_URL && env.CREWAI_API_TOKEN);
export const isMongoConfigured = Boolean(env.MONGO_URI);
