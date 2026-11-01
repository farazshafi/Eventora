import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function start(): Promise<void> {
  await connectDatabase();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Event Booking API listening');
  });

  let shuttingDown = false;
  const shutdown = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Shutting down API');
    server.close((error) => {
      if (error) logger.error({ err: error }, 'HTTP server shutdown failed');
      void disconnectDatabase()
        .then(() => process.exit(error ? 1 : 0))
        .catch((disconnectError: unknown) => {
          logger.error({ err: disconnectError }, 'Database shutdown failed');
          process.exit(1);
        });
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

void start().catch((error: unknown) => {
  logger.fatal({ err: error }, 'API startup failed');
  process.exitCode = 1;
});
