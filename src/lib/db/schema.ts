import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  credits: integer('credits').notNull().default(10),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

export const usersRelations = relations(users, ({ one }) => ({
  // Relations will be defined here if any other tables are added.
}));
