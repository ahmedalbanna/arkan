import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Use a local file for the SQLite database. 
const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'arkan.db');

/**
 * Global Singleton Pattern for SQLite Connection
 * Prevents multiple connections and SIGINT listener accumulation during Next.js hot reloads.
 */
const globalForDb = globalThis as unknown as {
  sqlite: Database.Database | undefined;
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

export const sqlite = globalForDb.sqlite ?? new Database(dbPath);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sqlite = sqlite;
}

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL');

export const db = globalForDb.db ?? drizzle(sqlite, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

export type DbClient = typeof db;
