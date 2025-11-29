import dotenv from 'dotenv';
dotenv.config({
  path: './.env',
});
import app from './app';
import dbConnection, { disconnectDB } from './dbConnection';
import { logError, logInfo } from './shared/logger';
import { Server } from 'http';

const port = process.env.PORT || 5000;
let server: Server;
let shuttingDown: boolean = false;

const shutdown = async (reason: string, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  try {
    logInfo(`Shutdown initiated: ${reason}`);

    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((closeErr) => {
          if (closeErr) {
            logError('Error closing HTTP server', closeErr);
            return reject(closeErr);
          }
          logInfo('HTTP server closed successfully');
          resolve();
        });
      });
    }

    await disconnectDB();

    logInfo('Shutdown completed successfully');
    process.exit(exitCode);
  } catch (shutdownErr) {
    logError('Error during shutdown', shutdownErr);
    process.exit(1);
  }
};

/** Process-level handlers */
// 1) Uncaught synchronous exceptions
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception — exiting', err);
  shutdown('uncaughtException', 1);
});

// 2) Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logError('Unhandled Promise Rejection — exiting', err);
  shutdown('unhandledRejection', 1);
});

// 3) SIGINT / SIGTERM for graceful shutdown
process.on('SIGINT', () => shutdown('SIGINT', 0));
process.on('SIGTERM', () => shutdown('SIGTERM', 0));

const start = async () => {
  try {
    await dbConnection();
    server = app.listen(port, () => {
      logInfo(`server is running at port ${port}`);
    });

    server.on('error', (err) => {
      logError('Server error', err);
      shutdown('Server error', 1);
    });
  } catch (err) {
    logError((err as Error).message);
    process.exit(1);
  }
};

start();
