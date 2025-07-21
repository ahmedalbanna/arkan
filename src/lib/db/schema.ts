import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  credits: integer('credits').notNull().default(10),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  bio: text('bio'),
  profilePictureUrl: text('profile_picture_url'),
  hasCompletedOnboarding: integer('has_completed_onboarding', { mode: 'boolean' }).default(false),
});

export const teams = sqliteTable('teams', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    ownerId: text('owner_id').notNull().references(() => users.id),
    createdAt: text('created_at').notNull(),
});

export const teamMembers = sqliteTable('team_members', {
    userId: text('user_id').notNull().references(() => users.id),
    teamId: text('team_id').notNull().references(() => teams.id),
    role: text('role', { enum: ['owner', 'member'] }).notNull().default('member'),
    joinedAt: text('joined_at').notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.teamId] }),
    }
});

export const transactions = sqliteTable('transactions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    planId: text('plan_id').notNull(),
    planName: text('plan_name').notNull(),
    credits: integer('credits').notNull(),
    price: integer('price').notNull(),
    userName: text('user_name').notNull(),
    userEmail: text('user_email').notNull(),
    status: text('status', { enum: ['pending', 'verified', 'rejected'] }).notNull(),
    proofUrl: text('proof_url').notNull(),
    createdAt: text('created_at').notNull(),
    adminNotes: text('admin_notes'),
    verifiedAt: text('verified_at'),
    verifiedBy: text('verified_by'),
});

export const agentGenerations = sqliteTable('agent_generations', {
    id: text('id').primaryKey(),
    agentId: text('agent_id').notNull(),
    userId: text('user_id').notNull().references(() => users.id),
    input: text('input', { mode: 'json' }).notNull(),
    output: text('output', { mode: 'json' }).notNull(),
    createdAt: text('created_at').notNull(),
});

// Storing templates and configurations
export const agents = sqliteTable('agents', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    pageUrl: text('page_url').notNull(),
    isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull(),
    prompt: text('prompt', { mode: 'json' }).notNull(),
});

export const features = sqliteTable('features', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull(),
});

export const docxTemplates = sqliteTable('docx_templates', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    styles: text('styles', { mode: 'json' }).notNull(),
    imageUrl: text('image_url').notNull(),
    dataAiHint: text('data_ai_hint').notNull(),
});

export const pptxTemplates = sqliteTable('pptx_templates', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    styles: text('styles', { mode: 'json' }).notNull(),
    imageUrl: text('image_url').notNull(),
    dataAiHint: text('data_ai_hint').notNull(),
});
