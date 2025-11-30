// File: src/api.ts (New Vercel entry file)

import dotenv from 'dotenv';
// Load environment variables *relative to the project root*
dotenv.config({
  path: './.env',
});

import app from './app'; // Import the Express app from app.ts within the same src directory
import { logError } from './shared/logger'; // Adjust path if shared/logger is not at src/shared/logger
import dbConnection from './dbConnection';

// Connect to the database on the first request (cold start)
dbConnection().catch((err) => {
  logError('Database connection failed on startup', err);
});

// ------------------- Vercel Handler Export -------------------
// Vercel expects an exported app handler.
export default app;
