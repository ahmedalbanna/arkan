import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Use a local file for the SQLite database. 
const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'arkan.db');

/**
 * Global Singleton Pattern for Database Connection
 * Prevents multiple connections and SIGINT listener accumulation during Next.js hot reloads.
 */
const globalForDb = globalThis as unknown as {
  database: Database.Database | undefined;
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

export const database = globalForDb.database ?? new Database(dbPath);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.database = database;
}

// Enable WAL mode for better concurrency
database.pragma('journal_mode = WAL');

export const db = globalForDb.db ?? drizzle(database, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

export type DbClient = typeof db;
