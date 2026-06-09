import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Sentry must be initialized before any other imports
import { initSentry, Sentry } from './config/sentry';
initSentry();

import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

process.on('unhandledRejection', (reason: unknown) => {
  console.error('[Process] Unhandled promise rejection:', reason);
  Sentry.captureException(reason);
  // Give Sentry time to flush before exiting
  setTimeout(() => process.exit(1), 1000);
});

process.on('uncaughtException', (err: Error) => {
  console.error('[Process] Uncaught exception:', err);
  Sentry.captureException(err);
  setTimeout(() => process.exit(1), 1000);
});

let server: ReturnType<typeof app.listen>;

async function gracefulShutdown(signal: string): Promise<void> {
  console.info(`[Process] ${signal} received — shutting down gracefully`);
  server?.close(() => {
    console.info('[Process] HTTP server closed');
    process.exit(0);
  });
  // Force exit after 10s if connections don't drain
  setTimeout(() => process.exit(1), 10_000);
}

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

const startServer = async () => {
  try {
    await connectDatabase();
    console.info('[MongoDB] Connected successfully');

    server = app.listen(env.PORT, () => {
      console.info(`[API] Feni Blood Line running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    Sentry.captureException(error);
    process.exit(1);
  }
};

void startServer();
