import { pgTable, text, integer, doublePrecision, boolean, timestamp, jsonb, index, serial, primaryKey, bigint } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  credits: integer('credits').default(0),
  role: text('role').$type<'admin' | 'user'>().default('user').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  bio: text('bio'),
  profilePictureUrl: text('profile_picture_url'),
  hasCompletedOnboarding: boolean('has_completed_onboarding').default(false),
  apiKeys: jsonb('api_keys'),
  lastDailyCreditUpdate: text('last_daily_credit_update'),
  passwordHash: text('password_hash'),
  securitySettings: jsonb('security_settings'),
  tokenVersion: integer('token_version').default(1),
  isDisabled: boolean('is_disabled').default(false),
  twoFactorSecret: text('two_factor_secret'),
  isTwoFactorEnabled: boolean('is_two_factor_enabled').default(false).notNull(),
});

export const projects = pgTable('projects', {
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
  teamMembers: jsonb('team_members'),
  logoUrl: text('logo_url'),
  universityLogoUrl: text('university_logo_url'),
  content: jsonb('content'),
  externalContext: jsonb('external_context'),
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
  behaviors: jsonb('behaviors'),
  rules: jsonb('rules'),
  constraints: jsonb('constraints'),
  citationStyle: text('citation_style'),
});

export const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  prompt: text('prompt').notNull(),
  guidelines: jsonb('guidelines'),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  author: text('author').notNull(),
  version: text('version').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const agentCategories = pgTable('agent_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  description: text('description'),
  order: integer('order').default(0),
});

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  planId: text('plan_id').notNull(),
  planName: text('plan_name').notNull(),
  credits: integer('credits').notNull(),
  price: doublePrecision('price').notNull(),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  status: text('status').$type<'pending' | 'verified' | 'rejected'>().notNull(),
  proofUrl: text('proof_url').notNull(),
  createdAt: text('created_at').notNull(),
  adminNotes: text('admin_notes'),
  verifiedAt: text('verified_at'),
  verifiedBy: text('verified_by'),
});

export const sections = pgTable('sections', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').$type<'report' | 'diagram' | 'presentation'>().notNull(),
  prompt: text('prompt'),
  guidelines: jsonb('guidelines'),
  model: text('model'),
});

export const templates = pgTable('templates', {
  id: text('id').primaryKey(),
  type: text('type').$type<'docx' | 'pptx' | 'report'>().notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  isDefault: boolean('is_default').default(false),
  content: jsonb('content'),
  projectType: text('project_type'),
  specialization: text('specialization'),
  university: text('university'),
  course: text('course'),
  educationalLevel: text('educational_level'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const features = pgTable('features', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  category: text('category'),
  updatedAt: text('updated_at').notNull(),
});

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
});

export const generationLogs = pgTable('generation_logs', {
  id: serial('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  userId: text('user_id').notNull(),
  input: jsonb('input').notNull(),
  output: jsonb('output').notNull(),
  creditCost: integer('credit_cost').notNull(),
  timestamp: text('timestamp').notNull(),
});

export const indexedDocuments = pgTable('indexed_documents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  userId: text('user_id'),
  sourceFile: text('source_file').notNull(),
  chunksCount: integer('chunks_count').notNull(),
  fileSize: integer('file_size').notNull(),
  type: text('type').$type<'report' | 'reference' | 'context' | 'user_upload'>().notNull(),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
  indexedAt: text('indexed_at').notNull(),
  chunkSize: integer('chunk_size').notNull(),
  overlap: integer('overlap').notNull(),
  status: text('status').$type<'indexed' | 'failed' | 'deleted'>().notNull(),
  errorMessage: text('error_message'),
});

export const passwordResets = pgTable('password_resets', {
  token: text('token').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: bigint('expires_at', { mode: 'number' }).notNull(),
  used: boolean('used').default(false).notNull(),
});

export const userFingerprints = pgTable('user_fingerprints', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  fingerprint: text('fingerprint').notNull(),
  lastUsedAt: text('last_used_at').notNull(),
  metadata: jsonb('metadata'),
  tokenVersion: integer('token_version'),
});

export const loginHistory = pgTable('login_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  timestamp: text('timestamp').notNull(),
  ip: text('ip'),
  location: text('location'),
  userAgent: text('user_agent'),
  fingerprint: text('fingerprint'),
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').$type<'info' | 'success' | 'warning' | 'alert' | 'error'>().default('info').notNull(),
  link: text('link'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: text('created_at').notNull(),
});

export const deviceTokens = pgTable('device_tokens', {
  token: text('token').primaryKey(),
  userId: text('user_id').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const scheduledNotifications = pgTable('scheduled_notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').$type<'info' | 'success' | 'warning' | 'alert' | 'error'>().default('info').notNull(),
  link: text('link'),
  scheduledFor: text('scheduled_at').notNull(),
  status: text('status').$type<'pending' | 'sent' | 'failed' | 'cancelled'>().default('pending').notNull(),
  targetUserId: text('user_id'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  statusIdx: index('scheduled_status_idx').on(table.status),
  scheduledForIdx: index('scheduled_time_idx').on(table.scheduledFor),
  targetUserIdx: index('scheduled_user_idx').on(table.targetUserId),
}));

export const securityAuditLogs = pgTable('security_audit_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  action: text('action').$type<'lockdown' | 'restore' | 'session_revocation' | 'password_change'>().notNull(),
  details: text('details'),
  adminId: text('admin_id'),
  timestamp: text('timestamp').notNull(),
  ip: text('ip'),
});

export const projectSnapshots = pgTable('project_snapshots', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  name: text('name').notNull(),
  snapshotData: jsonb('snapshot_data').notNull(),
  created: text('created_at').notNull(),
});
