import { PrismaClient } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';

// Explicitly load .env from backend and root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbPath = path.resolve(__dirname, '../../dev.db').replace(/\\/g, '/');
const databaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')
  ? process.env.DATABASE_URL
  : `file:${dbPath}`;

process.env.DATABASE_URL = databaseUrl;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
