import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  credits: integer('credits').notNull().default(0),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  bio: text('bio'),
  profilePictureUrl: text('profile_picture_url'),
});

export const usersRelations = relations(users, ({ many }) => ({
  content: many(content),
  transactions: many(transactions),
}));

// Content Type Table
export const contentTypes = sqliteTable('content_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  baseCreditCost: integer('base_credit_cost').notNull(),
  description: text('description'),
});

export const contentTypesRelations = relations(contentTypes, ({ many }) => ({
  content: many(content),
}));

// Content Table
export const content = sqliteTable('content', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentTypeId: integer('content_type_id').notNull().references(() => contentTypes.id),
  title: text('title').notNull(),
  filePath: text('file_path').notNull(),
  status: text('status').notNull(),
  creationDate: text('creation_date').notNull(),
  lastModifiedDate: text('last_modified_date'),
  creditCostApplied: integer('credit_cost_applied'),
});

export const contentRelations = relations(content, ({ one }) => ({
  user: one(users, {
    fields: [content.userId],
    references: [users.id],
  }),
  contentType: one(contentTypes, {
    fields: [content.contentTypeId],
    references: [contentTypes.id],
  }),
}));

// Transaction Table
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  type: text('type', { enum: ['purchase', 'usage'] }).notNull(),
  status: text('status', { enum: ['pending', 'verified', 'rejected'] }).notNull().default('pending'),
  timestamp: text('timestamp').notNull(),
  description: text('description'),
  proofUrl: text('proof_url'), // To store the path to the uploaded proof of payment
  adminNotes: text('admin_notes'), // For admins to add notes on verification/rejection
  verifiedBy: text('verified_by'), // ID of the admin who verified
  verifiedAt: text('verified_at'),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));
