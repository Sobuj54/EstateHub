import mongoose from 'mongoose';
import { logError, logInfo } from './shared/logger';

const dbConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${process.env.DB_NAME}`
    );
    logInfo(`Mongodb connection uri: ${connectionInstance.connection.host}`);
  } catch (error) {
    logError('mongodb connectio error: ', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.disconnect();
      logInfo('MongoDB disconnected gracefully');
    } catch (err) {
      logError('Error disconnecting MongoDB', err);
    }
  }
};

export default dbConnection;
