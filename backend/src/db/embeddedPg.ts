import net from 'net';
import path from 'path';
import { Client } from 'pg';

export function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

let pgInstance: any = null;

export async function ensurePostgresRunning(port = 5432) {
  const isOpen = await isPortOpen(port);
  if (isOpen) {
    console.log(`[PostgreSQL] Port ${port} is active, connecting to existing instance.`);
    return;
  }

  console.log(`[PostgreSQL] Starting embedded PostgreSQL 18 engine on port ${port}...`);
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const dbDir = path.resolve(process.cwd(), '.pgdata');

  pgInstance = new EmbeddedPostgres({
    port,
    databaseDir: dbDir,
    user: 'postgres',
    password: 'password',
    persistent: true,
  });

  try {
    await pgInstance.initialise();
  } catch (err: any) {
    // Already initialised is fine
  }

  await pgInstance.start();
  console.log(`[PostgreSQL] Embedded PostgreSQL 18 successfully started on port ${port}.`);

  // Ensure default database 'school_management' exists
  try {
    const client = new Client({
      connectionString: `postgresql://postgres:password@localhost:${port}/postgres`,
    });
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='school_management'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE school_management');
      console.log("[PostgreSQL] Created database 'school_management'.");
    }
    await client.end();
  } catch (err) {
    console.error('[PostgreSQL] Database check/create warning:', err);
  }
}

export async function stopPostgres() {
  if (pgInstance) {
    console.log('[PostgreSQL] Stopping embedded PostgreSQL instance...');
    await pgInstance.stop();
    pgInstance = null;
  }
}

if (process.argv[1] && process.argv[1].endsWith('embeddedPg.ts')) {
  ensurePostgresRunning().then(() => {
    console.log('[PostgreSQL] Standalone runner ready. Press Ctrl+C to terminate.');
  });
}

