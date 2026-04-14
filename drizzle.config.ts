import { defineConfig } from 'drizzle-kit';
// here can change db connection by choose schema and dialect provider
export default defineConfig({
  schema: './src/infrastructure/db/schema.pg.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
