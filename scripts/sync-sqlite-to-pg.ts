import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import * as sqliteSchema from '../src/infrastructure/db/schema';
import * as pgSchema from '../src/infrastructure/db/schema.pg';
import path from 'path';
import fs from 'fs';

async function sync() {
    const sqlitePath = path.join(process.cwd(), 'arkan.db');
    const pgUrl = process.env.DATABASE_URL;

    if (!pgUrl) {
        console.error("DATABASE_URL is not set.");
        process.exit(1);
    }

    if (!fs.existsSync(sqlitePath)) {
        console.error(`SQLite database not found at ${sqlitePath}`);
        process.exit(1);
    }

    console.log("Connecting to SQLite...");
    const sqliteConn = new Database(sqlitePath);
    const sqliteDb = drizzleSqlite(sqliteConn, { schema: sqliteSchema });

    console.log("Connecting to PostgreSQL...");
    const pgPool = new Pool({ connectionString: pgUrl });
    const pgDb = drizzlePg(pgPool, { schema: pgSchema });

    const tables = [
        { name: 'users', schema: sqliteSchema.users, pgSchema: pgSchema.users },
        { name: 'projects', schema: sqliteSchema.projects, pgSchema: pgSchema.projects },
        { name: 'agents', schema: sqliteSchema.agents, pgSchema: pgSchema.agents },
        { name: 'agent_categories', schema: sqliteSchema.agentCategories, pgSchema: pgSchema.agentCategories },
        { name: 'transactions', schema: sqliteSchema.transactions, pgSchema: pgSchema.transactions },
        { name: 'sections', schema: sqliteSchema.sections, pgSchema: pgSchema.sections },
        { name: 'templates', schema: sqliteSchema.templates, pgSchema: pgSchema.templates },
        { name: 'features', schema: sqliteSchema.features, pgSchema: pgSchema.features },
        { name: 'settings', schema: sqliteSchema.settings, pgSchema: pgSchema.settings },
        { name: 'generation_logs', schema: sqliteSchema.generationLogs, pgSchema: pgSchema.generationLogs },
        { name: 'indexed_documents', schema: sqliteSchema.indexedDocuments, pgSchema: pgSchema.indexedDocuments },
        { name: 'password_resets', schema: sqliteSchema.passwordResets, pgSchema: pgSchema.passwordResets },
        { name: 'user_fingerprints', schema: sqliteSchema.userFingerprints, pgSchema: pgSchema.userFingerprints },
        { name: 'login_history', schema: sqliteSchema.loginHistory, pgSchema: pgSchema.loginHistory },
        { name: 'notifications', schema: sqliteSchema.notifications, pgSchema: pgSchema.notifications },
        { name: 'device_tokens', schema: sqliteSchema.deviceTokens, pgSchema: pgSchema.deviceTokens },
        { name: 'scheduled_notifications', schema: sqliteSchema.scheduledNotifications, pgSchema: pgSchema.scheduledNotifications },
        { name: 'security_audit_logs', schema: sqliteSchema.securityAuditLogs, pgSchema: pgSchema.securityAuditLogs },
        { name: 'project_snapshots', schema: sqliteSchema.projectSnapshots, pgSchema: pgSchema.projectSnapshots },
    ];

    for (const table of tables) {
        console.log(`Syncing table: ${table.name}...`);
        const data = await sqliteDb.select().from(table.schema);
        console.log(`Found ${data.length} records in SQLite.`);

        if (data.length > 0) {
            // Transform data (SQLite integer booleans to actual booleans, and JSON strings to objects if needed)
            const transformedData = data.map(row => {
                const newRow: any = { ...row };
                // Drizzle-ORM handles most of this if the schemas are mapped correctly, 
                // but let's be explicit for SQLite's 1/0 booleans if the PG schema expects boolean.
                for (const key in newRow) {
                    if (typeof newRow[key] === 'string') {
                        try {
                            // Check if it's JSON (starts with [ or {)
                            if (newRow[key].startsWith('[') || newRow[key].startsWith('{')) {
                                newRow[key] = JSON.parse(newRow[key]);
                            }
                        } catch (e) {
                            // Not JSON, keep as string
                        }
                    }
                    // Handle booleans (SQLite stores as 1/0)
                    if (newRow[key] === 1 || newRow[key] === 0) {
                        // We need to check the PG schema to see if it's a boolean column
                        // For simplicity, we'll assume common boolean fields
                        if (['hasCompletedOnboarding', 'isDisabled', 'isTwoFactorEnabled', 'isEnabled', 'isDefault', 'used', 'isRead'].includes(key)) {
                            newRow[key] = !!newRow[key];
                        }
                    }
                }
                return newRow;
            });

            // Insert in chunks to avoid large payload errors
            const chunkSize = 100;
            for (let i = 0; i < transformedData.length; i += chunkSize) {
                const chunk = transformedData.slice(i, i + chunkSize);
                await pgDb.insert(table.pgSchema).values(chunk).onConflictDoNothing();
            }
        }
        console.log(`Finished syncing ${table.name}.`);
    }

    console.log("Sync complete!");
    await pgPool.end();
    sqliteConn.close();
}

sync().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
