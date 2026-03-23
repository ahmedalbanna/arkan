import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Use a local file for the SQLite database. 
// In a serverless environment like Vercel, /tmp is sometimes the only writable directory,
// but for a persistent local SQLite, we'll use the workspace root or a dedicated folder.
const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'arkan.db');

const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

export type DbClient = typeof db;
