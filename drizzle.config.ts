import { defineConfig } from 'drizzle-kit';
import { sql } from 'drizzle-orm'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: './sqlite.db',
  },
});
