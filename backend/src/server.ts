import app from './app';
import { config } from './config';
import { ensurePostgresRunning } from './db/embeddedPg';

const PORT = config.port;

async function bootstrap() {
  try {
    await ensurePostgresRunning();
    app.listen(PORT, () => {
      console.log(`🚀 Algions School Management API running on http://localhost:${PORT}`);
      console.log(`📚 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
