import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/amberlear',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};