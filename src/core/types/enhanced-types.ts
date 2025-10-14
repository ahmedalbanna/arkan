/**
 * Enhanced Type Definitions
 * Comprehensive type definitions with strict typing and no any types
 */

import { TypeGuards } from './type-guards';

// Base Types
export type Primitive = string | number | boolean | null | undefined;
export type Serializable = Primitive | Serializable[] | { [key: string]: Serializable };
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];
export type KeyOf<T> = keyof T;
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

// API Types
export interface ApiResponse<T = unknown> {
  readonly data: T;
  readonly status: number;
  readonly message?: string;
  readonly success: boolean;
  readonly timestamp: string;
  readonly requestId?: string;
}

export interface ApiError {
  readonly message: string;
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;
  readonly timestamp: string;
  readonly requestId?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
}

export interface SearchRequest {
  readonly query?: string;
  readonly filters?: Record<string, unknown>;
  readonly sort?: {
    readonly field: string;
    readonly direction: 'asc' | 'desc';
  };
  readonly pagination?: {
    readonly page: number;
    readonly limit: number;
  };
}

export interface SearchResponse<T = unknown> extends PaginatedResponse<T> {
  readonly search: {
    readonly query?: string;
    readonly filters?: Record<string, unknown>;
    readonly sort?: {
      readonly field: string;
      readonly direction: 'asc' | 'desc';
    };
    readonly facets?: Record<string, unknown>;
  };
}

// User Types
export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLoginAt?: Date;
  readonly isActive: boolean;
}

export interface UserProfile extends User {
  readonly avatar?: string;
  readonly bio?: string;
  readonly preferences?: UserPreferences;
  readonly settings?: UserSettings;
}

export interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly language: string;
  readonly timezone: string;
  readonly notifications: NotificationPreferences;
}

export interface UserSettings {
  readonly privacy: PrivacySettings;
  readonly security: SecuritySettings;
  readonly display: DisplaySettings;
}

export interface NotificationPreferences {
  readonly email: boolean;
  readonly push: boolean;
  readonly sms: boolean;
  readonly inApp: boolean;
}

export interface PrivacySettings {
  readonly profileVisibility: 'public' | 'private' | 'friends';
  readonly showEmail: boolean;
  readonly showLastSeen: boolean;
}

export interface SecuritySettings {
  readonly twoFactorEnabled: boolean;
  readonly loginNotifications: boolean;
  readonly sessionTimeout: number;
}

export interface DisplaySettings {
  readonly dateFormat: string;
  readonly timeFormat: '12h' | '24h';
  readonly currency: string;
}

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest';

// Project Types
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: ProjectType;
  readonly status: ProjectStatus;
  readonly ownerId: string;
  readonly teamId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly dueDate?: Date;
  readonly tags: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

export interface ProjectContent {
  readonly id: string;
  readonly projectId: string;
  readonly type: ContentType;
  readonly title: string;
  readonly content: string;
  readonly version: number;
  readonly authorId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isPublished: boolean;
}

export type ProjectType = 'business' | 'academic' | 'personal' | 'research' | 'development';
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived' | 'cancelled';
export type ContentType = 'proposal' | 'report' | 'presentation' | 'document' | 'analysis';

// Team Types
export interface Team {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly ownerId: string;
  readonly members: readonly TeamMember[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly settings: TeamSettings;
}

export interface TeamMember {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly role: TeamRole;
  readonly joinedAt: Date;
  readonly permissions: readonly TeamPermission[];
}

export interface TeamSettings {
  readonly visibility: 'public' | 'private' | 'invite-only';
  readonly allowMemberInvites: boolean;
  readonly requireApproval: boolean;
  readonly defaultRole: TeamRole;
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';
export type TeamPermission = 'read' | 'write' | 'delete' | 'invite' | 'manage';

// Agent Types
export interface Agent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: AgentCategory;
  readonly status: AgentStatus;
  readonly ownerId: string;
  readonly teamId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly configuration: AgentConfiguration;
  readonly capabilities: readonly AgentCapability[];
}

export interface AgentConfiguration {
  readonly model: string;
  readonly temperature: number;
  readonly maxTokens: number;
  readonly systemPrompt?: string;
  readonly tools: readonly string[];
  readonly settings: Record<string, unknown>;
}

export interface AgentCapability {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
  readonly enabled: boolean;
}

export type AgentCategory = 'writing' | 'analysis' | 'research' | 'automation' | 'custom';
export type AgentStatus = 'active' | 'inactive' | 'maintenance' | 'deprecated';

// File Types
export interface FileUpload {
  readonly id: string;
  readonly filename: string;
  readonly originalName: string;
  readonly mimeType: string;
  readonly size: number;
  readonly url: string;
  readonly uploadedBy: string;
  readonly uploadedAt: Date;
  readonly metadata?: Record<string, unknown>;
}

export interface FileUploadRequest {
  readonly file: File;
  readonly folder?: string;
  readonly metadata?: Record<string, unknown>;
  readonly onProgress?: (progress: number) => void;
}

export interface FileUploadResponse {
  readonly id: string;
  readonly filename: string;
  readonly url: string;
  readonly size: number;
  readonly type: string;
}

// Export Types
export interface ExportRequest {
  readonly content: unknown;
  readonly format: ExportFormat;
  readonly options: ExportOptions;
  readonly metadata?: ExportMetadata;
}

export interface ExportResponse {
  readonly url: string;
  readonly filename: string;
  readonly size: number;
  readonly expiresAt: Date;
}

export interface ExportOptions {
  readonly includeImages?: boolean;
  readonly includeCharts?: boolean;
  readonly watermark?: string;
  readonly password?: string;
  readonly quality?: 'low' | 'medium' | 'high';
  readonly compression?: boolean;
}

export interface ExportMetadata {
  readonly title?: string;
  readonly author?: string;
  readonly subject?: string;
  readonly keywords?: readonly string[];
  readonly language?: string;
  readonly version?: string;
}

export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'html' | 'markdown' | 'json' | 'csv';

// Transaction Types
export interface Transaction {
  readonly id: string;
  readonly userId: string;
  readonly type: TransactionType;
  readonly amount: number;
  readonly currency: string;
  readonly description: string;
  readonly status: TransactionStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata?: Record<string, unknown>;
}

export type TransactionType = 'credit' | 'debit' | 'refund' | 'bonus';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

// Notification Types
export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly data?: Record<string, unknown>;
  readonly read: boolean;
  readonly createdAt: Date;
  readonly expiresAt?: Date;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

// Event Types
export interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly version: number;
  readonly data: Record<string, unknown>;
  readonly metadata: EventMetadata;
  readonly timestamp: Date;
}

export interface EventMetadata {
  readonly userId?: string;
  readonly sessionId?: string;
  readonly requestId?: string;
  readonly source: string;
  readonly version: string;
  readonly correlationId?: string;
  readonly causationId?: string;
}

// Cache Types
export interface CacheEntry<T = unknown> {
  readonly key: string;
  readonly value: T;
  readonly ttl: number;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly accessCount: number;
  readonly lastAccessed: Date;
}

export interface CacheOptions {
  readonly ttl?: number;
  readonly maxSize?: number;
  readonly strategy?: CacheStrategy;
  readonly compression?: boolean;
  readonly encryption?: boolean;
}

export type CacheStrategy = 'lru' | 'lfu' | 'ttl' | 'fifo' | 'adaptive';

// Performance Types
export interface PerformanceMetric {
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly timestamp: Date;
  readonly category: PerformanceCategory;
  readonly tags?: Record<string, string>;
}

export type PerformanceCategory = 'memory' | 'cpu' | 'network' | 'rendering' | 'ai' | 'custom';

export interface PerformanceReport {
  readonly timestamp: Date;
  readonly duration: number;
  readonly metrics: readonly PerformanceMetric[];
  readonly summary: PerformanceSummary;
  readonly recommendations: readonly string[];
}

export interface PerformanceSummary {
  readonly overallScore: number;
  readonly memoryScore: number;
  readonly cpuScore: number;
  readonly networkScore: number;
  readonly renderingScore: number;
  readonly aiScore: number;
}

// Validation Types
export interface ValidationResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly errors: readonly ValidationError[];
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
  readonly value?: unknown;
  readonly expected?: unknown;
}

export interface ValidationRule<T = unknown> {
  readonly field: string;
  readonly validator: (value: unknown) => value is T;
  readonly message: string;
  readonly code: string;
}

// Form Types
export interface FormField<T = unknown> {
  readonly name: string;
  readonly label: string;
  readonly type: FormFieldType;
  readonly value: T;
  readonly required: boolean;
  readonly disabled: boolean;
  readonly placeholder?: string;
  readonly helpText?: string;
  readonly validation?: ValidationRule<T>;
  readonly options?: readonly FormOption[];
}

export interface FormOption {
  readonly value: string | number;
  readonly label: string;
  readonly disabled?: boolean;
}

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'textarea'
  | 'file';

export interface FormData<T = Record<string, unknown>> {
  readonly fields: Record<keyof T, FormField<T[keyof T]>>;
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
  readonly touched: Record<keyof T, boolean>;
  readonly dirty: Record<keyof T, boolean>;
}

// Hook Types
export interface HookResult<T = unknown, E = Error> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: E | null;
  readonly refetch: () => Promise<void>;
  readonly mutate: (data: T) => void;
}

export interface AsyncHookResult<T = unknown, E = Error> extends HookResult<T, E> {
  readonly execute: (...args: unknown[]) => Promise<T>;
}

// Component Types
export interface ComponentProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly id?: string;
  readonly 'data-testid'?: string;
}

export interface ButtonProps extends ComponentProps {
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: () => void;
}

export interface InputProps extends ComponentProps {
  readonly type?: FormFieldType;
  readonly value?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly error?: string;
  readonly onChange?: (value: string) => void;
}

// Type-safe utility functions
export function createApiResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): ApiResponse<T> {
  return {
    data,
    status,
    message,
    success: status >= 200 && status < 300,
    timestamp: new Date().toISOString()
  };
}

export function createApiError(
  message: string,
  code: string,
  status: number = 500,
  details?: Record<string, unknown>
): ApiError {
  return {
    message,
    code,
    status,
    details,
    timestamp: new Date().toISOString()
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  status: number = 200
): PaginatedResponse<T> {
  return {
    data,
    pagination,
    status,
    success: true,
    timestamp: new Date().toISOString()
  };
}

// Type-safe builders
export class TypeSafeBuilder<T> {
  private data: Partial<T> = {};

  set<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value;
    return this;
  }

  build(): T {
    if (!TypeGuards.isPlainObject(this.data)) {
      throw new Error('Builder data is not a plain object');
    }
    return this.data as T;
  }
}

// Type-safe factory functions
export function createUser(overrides: Partial<User> = {}): User {
  const now = new Date();
  return {
    id: '',
    email: '',
    name: '',
    role: 'user',
    createdAt: now,
    updatedAt: now,
    isActive: true,
    ...overrides
  };
}

export function createProject(overrides: Partial<Project> = {}): Project {
  const now = new Date();
  return {
    id: '',
    name: '',
    type: 'business',
    status: 'draft',
    ownerId: '',
    createdAt: now,
    updatedAt: now,
    tags: [],
    ...overrides
  };
}

export function createTeam(overrides: Partial<Team> = {}): Team {
  const now = new Date();
  return {
    id: '',
    name: '',
    ownerId: '',
    members: [],
    createdAt: now,
    updatedAt: now,
    settings: {
      visibility: 'private',
      allowMemberInvites: false,
      requireApproval: true,
      defaultRole: 'member'
    },
    ...overrides
  };
}

// Export all types
export type {
    ArrayElement, DeepMutable, DeepPartial, DeepReadonly, DeepRequired, KeyOf, NonNullable,
    Optional, Primitive, Required, Serializable, ValueOf
};

