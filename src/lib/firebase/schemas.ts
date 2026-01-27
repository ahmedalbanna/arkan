import { z } from 'zod';

/**
 * Firebase Firestore Schemas & Validation
 * 
 * Centralized Zod schemas for all Firestore collections.
 * Provides runtime type validation, error handling, and TypeScript type inference.
 * 
 * Usage:
 * - Server-side validation in API routes: const validated = UserSchema.parse(data)
 * - Type inference: type User = z.infer<typeof UserSchema>
 * - Custom validators: validateUser(), validateNotification(), etc.
 * 
 * @module firebase/schemas
 */

// ============================================================================
// BASE SCHEMAS & UTILITIES
// ============================================================================

/**
 * Common timestamp validation
 */
export const TimestampSchema = z.string().datetime('Invalid ISO datetime format');

/**
 * Common UUID validation
 */
export const UUIDSchema = z.string().uuid('Invalid UUID format');

/**
 * Common email validation
 */
export const EmailSchema = z.string().email('Invalid email address');

/**
 * Common URL validation (allows empty string)
 */
export const URLSchema = z.string().url('Invalid URL').or(z.string().length(0));

/**
 * Pagination metadata
 */
export const PaginationMetaSchema = z.object({
  total: z.number().int().min(0),
  limit: z.number().int().min(1).max(100),
  offset: z.number().int().min(0),
  hasMore: z.boolean(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

// ============================================================================
// USER COLLECTION SCHEMA
// ============================================================================

/**
 * User role enumeration
 */
export const UserRoleSchema = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Complete User Schema
 */
export const UserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  email: EmailSchema,
  role: UserRoleSchema,
  credits: z.number().int().min(0, 'Credits cannot be negative').default(0),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  bio: z.string().max(1000, 'Bio too long').optional().default(''),
  profilePictureUrl: URLSchema.optional(),
  hasCompletedOnboarding: z.boolean().optional().default(false),
  lastDailyCreditUpdate: TimestampSchema.optional(),
  apiKeys: z.record(z.string(), z.string()).optional(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Partial User for creation (without id, timestamps)
 */
export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateUser = z.infer<typeof CreateUserSchema>;

/**
 * Partial User for updates
 */
export const UpdateUserSchema = UserSchema.partial();
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// ============================================================================
// PROJECT COLLECTION SCHEMA
// ============================================================================

/**
 * Project metadata
 */
export const ProjectMetaSchema = z.object({
  author: z.string().min(1, 'Author is required'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format'),
  created: TimestampSchema,
  updated: TimestampSchema,
});

export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;

/**
 * Content item in project (Chapter or Section)
 */
export const ProjectContentItemSchema = z.object({
  id: UUIDSchema,
  title: z.string().min(1, 'Title is required').max(200),
  type: z.enum(['chapter', 'section']),
  content: z.string().optional(),
  sections: z.array(z.object({
    id: UUIDSchema,
    title: z.string().min(1).max(200),
    content: z.string().optional(),
  })).optional(),
});

export type ProjectContentItem = z.infer<typeof ProjectContentItemSchema>;

/**
 * Complete Project Schema
 */
export const ProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(1000).optional(),
  projectDescription: z.string().max(5000).optional(),
  projectType: z.string().max(100).optional(),
  specialization: z.string().max(100).optional(),
  university: z.string().max(200).optional(),
  supervisor: z.string().max(200).optional(),
  course: z.string().max(200).optional(),
  educationalLevel: z.string().max(100).optional(),
  teamMembers: z.array(z.string().max(200)).optional(),
  logoUrl: URLSchema.optional(),
  universityLogoUrl: URLSchema.optional(),
  content: z.array(ProjectContentItemSchema).optional(),
  externalContext: z.array(z.object({
    fileName: z.string().min(1),
    content: z.string().min(1),
    type: z.enum(['text', 'code', 'data']),
  })).optional(),
  meta: ProjectMetaSchema,
  tableOfContentsMarkdown: z.string().max(10000).optional(),
  activeSectionId: UUIDSchema.optional(),
  language: z.enum(['en', 'ar']).optional(),
  complexity: z.number().min(0).max(100).optional(),
  formality: z.number().min(0).max(100).optional(),
  tone: z.string().optional(),
  rules: z.array(z.string().max(500)).optional(),
  constraints: z.array(z.string().max(500)).optional(),
  citationStyle: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

/**
 * Partial Project for creation
 */
export const CreateProjectSchema = ProjectSchema.omit({ id: true, meta: true }).extend({
  meta: ProjectMetaSchema.omit({ created: true, updated: true }),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;

/**
 * Partial Project for updates
 */
export const UpdateProjectSchema = ProjectSchema.partial();
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;

// ============================================================================
// SECTION COLLECTION SCHEMA
// ============================================================================

/**
 * Section status enumeration
 */
export const SectionStatusSchema = z.enum(['draft', 'generating', 'generated', 'edited', 'failed']);
export type SectionStatus = z.infer<typeof SectionStatusSchema>;

/**
 * Complete Section Schema
 */
export const SectionSchema = z.object({
  id: UUIDSchema,
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().optional(),
  order: z.number().int().min(0),
  status: SectionStatusSchema.optional().default('draft'),
  metadata: z.object({
    wordCount: z.number().int().min(0).optional(),
    characterCount: z.number().int().min(0).optional(),
    generatedAt: TimestampSchema.optional(),
    editedAt: TimestampSchema.optional(),
  }).optional(),
  context: z.record(z.any()).optional(),
  guidelines: z.array(z.string()).optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Section = z.infer<typeof SectionSchema>;

/**
 * Partial Section for creation
 */
export const CreateSectionSchema = SectionSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateSection = z.infer<typeof CreateSectionSchema>;

/**
 * Partial Section for updates
 */
export const UpdateSectionSchema = SectionSchema.partial();
export type UpdateSection = z.infer<typeof UpdateSectionSchema>;

// ============================================================================
// TEMPLATE COLLECTION SCHEMA
// ============================================================================

/**
 * Template type enumeration
 */
export const TemplateTypeSchema = z.enum(['docx', 'pptx', 'report', 'custom']);
export type TemplateType = z.infer<typeof TemplateTypeSchema>;

/**
 * Complete Template Schema
 */
export const TemplateSchema = z.object({
  id: z.string().min(1, 'Template ID is required'),
  name: z.string().min(1, 'Template name is required').max(200),
  description: z.string().max(1000).optional(),
  type: TemplateTypeSchema,
  content: z.record(z.any()).optional(),
  metadata: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().default('1.0.0'),
  }).optional(),
  isPublic: z.boolean().default(false),
  createdBy: z.string().min(1),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Template = z.infer<typeof TemplateSchema>;

/**
 * Partial Template for creation
 */
export const CreateTemplateSchema = TemplateSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateTemplate = z.infer<typeof CreateTemplateSchema>;

/**
 * Partial Template for updates
 */
export const UpdateTemplateSchema = TemplateSchema.partial();
export type UpdateTemplate = z.infer<typeof UpdateTemplateSchema>;

// ============================================================================
// TRANSACTION COLLECTION SCHEMA
// ============================================================================

/**
 * Transaction status enumeration
 */
export const TransactionStatusSchema = z.enum(['pending', 'verified', 'rejected']);
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

/**
 * Complete Transaction Schema
 */
export const TransactionSchema = z.object({
  id: z.string().min(1, 'Transaction ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  planName: z.string().min(1, 'Plan name is required'),
  credits: z.number().int().min(1, 'Credits must be at least 1'),
  price: z.number().min(0, 'Price cannot be negative'),
  userName: z.string().min(1, 'User name is required'),
  userEmail: EmailSchema,
  status: TransactionStatusSchema,
  proofUrl: z.string().url('Invalid proof URL'),
  createdAt: TimestampSchema,
  adminNotes: z.string().max(1000).optional(),
  verifiedAt: TimestampSchema.optional(),
  verifiedBy: z.string().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * Partial Transaction for creation
 */
export const CreateTransactionSchema = TransactionSchema.omit({ id: true, createdAt: true });
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;

/**
 * Partial Transaction for updates
 */
export const UpdateTransactionSchema = TransactionSchema.partial();
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;

// ============================================================================
// NOTIFICATION COLLECTION SCHEMA
// ============================================================================

/**
 * Notification type enumeration
 */
export const NotificationTypeSchema = z.enum(['info', 'success', 'warning', 'error']);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

/**
 * Complete Notification Schema
 */
export const NotificationSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  type: NotificationTypeSchema.default('info'),
  title: z.string().min(1, 'Title is required').max(100),
  message: z.string().min(1, 'Message is required').max(500),
  read: z.boolean().default(false),
  actionUrl: z.string().url('Invalid URL').optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: TimestampSchema,
  readAt: TimestampSchema.optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

/**
 * Partial Notification for creation
 */
export const CreateNotificationSchema = NotificationSchema.omit({ id: true, createdAt: true, readAt: true });
export type CreateNotification = z.infer<typeof CreateNotificationSchema>;

/**
 * Partial Notification for updates
 */
export const UpdateNotificationSchema = NotificationSchema.partial();
export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>;

// ============================================================================
// AGENT COLLECTION SCHEMA
// ============================================================================

/**
 * Agent capability enumeration
 */
export const AgentCapabilitySchema = z.enum([
  'generate_text',
  'analyze_text',
  'translate',
  'summarize',
  'detect_ai',
  'fact_check',
  'check_plagiarism',
  'check_bias',
  'grammar_check',
]);

export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;

/**
 * Complete Agent Schema
 */
export const AgentSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
  name: z.string().min(1, 'Agent name is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  category: z.string().min(1, 'Category is required').max(50),
  capabilities: z.array(AgentCapabilitySchema).min(1, 'At least one capability is required'),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
  isActive: z.boolean().default(true),
  config: z.record(z.any()).optional(),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type Agent = z.infer<typeof AgentSchema>;

/**
 * Partial Agent for creation
 */
export const CreateAgentSchema = AgentSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateAgent = z.infer<typeof CreateAgentSchema>;

/**
 * Partial Agent for updates
 */
export const UpdateAgentSchema = AgentSchema.partial();
export type UpdateAgent = z.infer<typeof UpdateAgentSchema>;

// ============================================================================
// CUSTOM VALIDATION ERROR CLASSES
// ============================================================================

/**
 * Base validation error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly details?: z.ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * User validation error
 */
export class UserValidationError extends ValidationError {
  constructor(message: string, field?: string, details?: z.ZodError) {
    super(message, field, details);
    this.name = 'UserValidationError';
  }
}

/**
 * Project validation error
 */
export class ProjectValidationError extends ValidationError {
  constructor(message: string, field?: string, details?: z.ZodError) {
    super(message, field, details);
    this.name = 'ProjectValidationError';
  }
}

/**
 * Section validation error
 */
export class SectionValidationError extends ValidationError {
  constructor(message: string, field?: string, details?: z.ZodError) {
    super(message, field, details);
    this.name = 'SectionValidationError';
  }
}

/**
 * Template validation error
 */
export class TemplateValidationError extends ValidationError {
  constructor(message: string, field?: string, details?: z.ZodError) {
    super(message, field, details);
    this.name = 'TemplateValidationError';
  }
}

/**
 * Transaction validation error
 */
export class TransactionValidationError extends ValidationError {
  constructor(message: string, field?: string, details?: z.ZodError) {
    super(message, field, details);
    this.name = 'TransactionValidationError';
  }
}

/**
 * Notification validation error
 */
export class NotificationValidationError extends ValidationError {
  constructor(message: string, field?: string, details?: z.ZodError) {
    super(message, field, details);
    this.name = 'NotificationValidationError';
  }
}

/**
 * Agent validation error
 */
export class AgentValidationError extends ValidationError {
  constructor(message: string, field?: string, details?: z.ZodError) {
    super(message, field, details);
    this.name = 'AgentValidationError';
  }
}

// ============================================================================
// SCHEMA REGISTRY (for dynamic access)
// ============================================================================

/**
 * Registry mapping collection names to their schemas
 */
export const SchemaRegistry = {
  users: UserSchema,
  projects: ProjectSchema,
  sections: SectionSchema,
  templates: TemplateSchema,
  transactions: TransactionSchema,
  notifications: NotificationSchema,
  agents: AgentSchema,
} as const;

export type SchemaRegistryKey = keyof typeof SchemaRegistry;

/**
 * Get schema for a collection by name
 */
export function getSchema<K extends SchemaRegistryKey>(collectionName: K) {
  return SchemaRegistry[collectionName];
}
