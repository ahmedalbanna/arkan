/**
 * Firebase Module Index
 * 
 * Centralized exports for Firebase Admin SDK, DB helpers, schemas, and validation utilities.
 * Provides a single import point for all Firebase-related functionality.
 * 
 * Usage:
 * import { 
 *   adminDb, 
 *   UserSchema, 
 *   validateUser,
 *   saveProjectHelper 
 * } from '@/lib/firebase';
 */

// ============================================================================
// FIREBASE ADMIN SDK
// ============================================================================

export { adminAuth, adminDb, adminRealtimeDb } from './server-init';

// ============================================================================
// DATABASE HELPERS
// ============================================================================

export {
  // Generic helpers
  getDoc,
  listDocs,
  createDoc,
  updateDoc,
  deleteDoc,
  paginateQuery,
  batchWrite,
  runTransaction,
  // User helpers
  getUserHelper,
  listUsersHelper,
  createUserDocHelper,
  updateUserHelper,
  deleteUserDocHelper,
  getUserCreditsHelper,
  deductUserCreditsHelper,
  addUserCreditsHelper,
  // Project helpers
  getProjectHelper,
  listProjectsByAuthorHelper,
  saveProjectHelper,
  deleteProjectHelper,
  // Section helpers
  getSectionHelper,
  listSectionsByProjectHelper,
  saveSectionHelper,
  deleteSectionHelper,
  // Template helpers
  getTemplateHelper,
  listTemplatesHelper,
  saveTemplateHelper,
  deleteTemplateHelper,
  // Transaction helpers
  getTransactionHelper,
  listUserTransactionsHelper,
  createTransactionHelper,
  // Notification helpers
  getNotificationHelper,
  listUserNotificationsHelper,
  createNotificationHelper,
  markNotificationAsReadHelper,
  // Agent helpers
  getAgentHelper,
  listAgentsHelper,
  saveAgentHelper,
  deleteAgentHelper,
  // Types
  type PaginatedResult,
  type QueryFilter,
  type QueryOptions,
} from './db-helpers';

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

export {
  // Base schemas
  TimestampSchema,
  UUIDSchema,
  EmailSchema,
  URLSchema,
  PaginationMetaSchema,
  type PaginationMeta,
  // User schemas & types
  UserRoleSchema,
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  type UserRole,
  type User,
  type CreateUser,
  type UpdateUser,
  // Project schemas & types
  ProjectMetaSchema,
  ProjectContentItemSchema,
  ProjectSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  type ProjectMeta,
  type ProjectContentItem,
  type Project,
  type CreateProject,
  type UpdateProject,
  // Section schemas & types
  SectionStatusSchema,
  SectionSchema,
  CreateSectionSchema,
  UpdateSectionSchema,
  type SectionStatus,
  type Section,
  type CreateSection,
  type UpdateSection,
  // Template schemas & types
  TemplateTypeSchema,
  TemplateSchema,
  CreateTemplateSchema,
  UpdateTemplateSchema,
  type TemplateType,
  type Template,
  type CreateTemplate,
  type UpdateTemplate,
  // Transaction schemas & types
  TransactionStatusSchema,
  TransactionSchema,
  CreateTransactionSchema,
  UpdateTransactionSchema,
  type TransactionStatus,
  type Transaction,
  type CreateTransaction,
  type UpdateTransaction,
  // Notification schemas & types
  NotificationTypeSchema,
  NotificationSchema,
  CreateNotificationSchema,
  UpdateNotificationSchema,
  type NotificationType,
  type Notification,
  type CreateNotification,
  type UpdateNotification,
  // Agent schemas & types
  AgentCapabilitySchema,
  AgentSchema,
  CreateAgentSchema,
  UpdateAgentSchema,
  type AgentCapability,
  type Agent,
  type CreateAgent,
  type UpdateAgent,
  // Schema registry
  SchemaRegistry,
  getSchema,
  type SchemaRegistryKey,
} from './schemas';

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export {
  ValidationError,
  UserValidationError,
  ProjectValidationError,
  SectionValidationError,
  TemplateValidationError,
  TransactionValidationError,
  NotificationValidationError,
  AgentValidationError,
} from './schemas';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export {
  // User validators
  validateUser,
  validateCreateUser,
  validateUpdateUser,
  validateEmail,
  validateCredits,
  // Project validators
  validateProject,
  validateCreateProject,
  validateUpdateProject,
  findDuplicateIds,
  validateUniqueIds,
  validateExternalContextReferences,
  validateSectionReferences,
  // Section validators
  validateSection,
  validateCreateSection,
  validateUpdateSection,
  // Template validators
  validateTemplate,
  validateCreateTemplate,
  validateUpdateTemplate,
  // Transaction validators
  validateTransaction,
  validateCreateTransaction,
  validateUpdateTransaction,
  validateTransactionStatus,
  // Notification validators
  validateNotification,
  validateCreateNotification,
  validateUpdateNotification,
  // Agent validators
  validateAgent,
  validateCreateAgent,
  validateUpdateAgent,
  // Safe parsing (no throw)
  safeParseUser,
  safeParseProject,
  safeParseNotification,
  safeParseTransaction,
} from './validation-helpers';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export { CustomFirebaseError, handleFirebaseError } from './error';
