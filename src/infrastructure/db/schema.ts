import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  credits: integer('credits').default(0),
  role: text('role').$type<'admin' | 'user'>().default('user').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  bio: text('bio'),
  profilePictureUrl: text('profile_picture_url'),
  hasCompletedOnboarding: integer('has_completed_onboarding', { mode: 'boolean' }).default(false),
  apiKeys: text('api_keys'), // JSON
  lastDailyCreditUpdate: text('last_daily_credit_update'),
  passwordHash: text('password_hash'),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  projectDescription: text('project_description'),
  projectType: text('project_type'),
  specialization: text('specialization'),
  university: text('university'),
  supervisor: text('supervisor'),
  course: text('course'),
  educationalLevel: text('educational_level'),
  teamMembers: text('team_members'), // JSON array
  logoUrl: text('logo_url'),
  universityLogoUrl: text('university_logo_url'),
  content: text('content'), // JSON array of chapters/sections
  externalContext: text('external_context'), // JSON array
  authorId: text('author_id').notNull(),
  version: text('version').default('1.0.0'),
  created: text('created_at').notNull(),
  updated: text('updated_at').notNull(),
  tableOfContentsMarkdown: text('table_of_contents_markdown'),
  activeSectionId: text('active_section_id'),
  language: text('language'),
  complexity: integer('complexity').default(50),
  formality: integer('formality').default(70),
  tone: text('tone'),
  behaviors: text('behaviors'), // JSON
  rules: text('rules'), // JSON
  constraints: text('constraints'), // JSON
  citationStyle: text('citation_style'),
});

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  prompt: text('prompt').notNull(),
  guidelines: text('guidelines'), // JSON array
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true).notNull(),
  author: text('author').notNull(),
  version: text('version').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const agentCategories = sqliteTable('agent_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  description: text('description'),
  order: integer('order').default(0),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  planId: text('plan_id').notNull(),
  planName: text('plan_name').notNull(),
  credits: integer('credits').notNull(),
  price: real('price').notNull(),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  status: text('status').$type<'pending' | 'verified' | 'rejected'>().notNull(),
  proofUrl: text('proof_url').notNull(),
  createdAt: text('created_at').notNull(),
  adminNotes: text('admin_notes'),
  verifiedAt: text('verified_at'),
  verifiedBy: text('verified_by'),
});

export const sections = sqliteTable('sections', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').$type<'report' | 'diagram' | 'presentation'>().notNull(),
  prompt: text('prompt'),
  guidelines: text('guidelines'), // JSON array
  model: text('model'),
});

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  type: text('type').$type<'docx' | 'pptx' | 'report'>().notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  content: text('content'), // JSON
  projectType: text('project_type'),
  specialization: text('specialization'),
  university: text('university'),
  course: text('course'),
  educationalLevel: text('educational_level'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const features = sqliteTable('features', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true).notNull(),
  category: text('category'),
  updatedAt: text('updated_at').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(), // JSON
});

export const generationLogs = sqliteTable('generation_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agentId: text('agent_id').notNull(),
  userId: text('user_id').notNull(),
  input: text('input').notNull(), // JSON
  output: text('output').notNull(), // JSON
  creditCost: integer('credit_cost').notNull(),
  timestamp: text('timestamp').notNull(),
});

export const indexedDocuments = sqliteTable('indexed_documents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  userId: text('user_id'),
  sourceFile: text('source_file').notNull(),
  chunksCount: integer('chunks_count').notNull(),
  fileSize: integer('file_size').notNull(),
  type: text('type').$type<'report' | 'reference' | 'context' | 'user_upload'>().notNull(),
  timestamp: integer('timestamp').notNull(),
  indexedAt: text('indexed_at').notNull(),
  chunkSize: integer('chunk_size').notNull(),
  overlap: integer('overlap').notNull(),
  status: text('status').$type<'indexed' | 'failed' | 'deleted'>().notNull(),
  errorMessage: text('error_message'),
});

export const passwordResets = sqliteTable('password_resets', {
  token: text('token').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: integer('expires_at').notNull(),
  used: integer('used', { mode: 'boolean' }).default(false).notNull(),
});

export const userFingerprints = sqliteTable('user_fingerprints', {
  id: text('id').primaryKey(), // uuid
  userId: text('user_id').notNull(),
  fingerprint: text('fingerprint').notNull(),
  lastUsedAt: text('last_used_at').notNull(),
  metadata: text('metadata'), // JSON string of attributes
});
