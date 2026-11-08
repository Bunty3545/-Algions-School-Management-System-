import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const defaultUrl = 'postgresql://postgres:password@localhost:5432/school_management?schema=public';
const databaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')
  ? process.env.DATABASE_URL
  : defaultUrl;

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
