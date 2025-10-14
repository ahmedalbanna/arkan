/**
 * Advanced API Validation System
 * Comprehensive validation with type safety and custom validators
 */

import { z } from 'zod';
import { TypeGuards } from '../../types/type-guards';

export interface ValidationRule<T = unknown> {
  field: string;
  validator: (value: unknown) => value is T;
  message: string;
  code: string;
  required?: boolean;
}

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
  expected?: unknown;
  path: string[];
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: unknown;
  suggestion?: string;
}

export interface ValidationOptions {
  strict?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
  abortEarly?: boolean;
  context?: Record<string, unknown>;
}

// Custom Validators
export class CustomValidators {
  static email = z.string().email('Invalid email format');

  static password = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

  static phone = z.string().regex(
    /^\+?[\d\s\-\(\)]+$/,
    'Invalid phone number format'
  );

  static url = z.string().url('Invalid URL format');

  static uuid = z.string().uuid('Invalid UUID format');

  static dateString = z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Invalid date format'
  );

  static positiveNumber = z.number().positive('Number must be positive');

  static nonNegativeNumber = z.number().min(0, 'Number must be non-negative');

  static integer = z.number().int('Number must be an integer');

  static positiveInteger = z.number().int().positive('Number must be a positive integer');

  static nonEmptyString = z.string().min(1, 'String cannot be empty');

  static slug = z.string().regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Invalid slug format (use lowercase letters, numbers, and hyphens)'
  );

  static hexColor = z.string().regex(
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    'Invalid hex color format'
  );

  static base64 = z.string().regex(
    /^[A-Za-z0-9+/]*={0,2}$/,
    'Invalid base64 format'
  );

  static jsonString = z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    'Invalid JSON format'
  );

  static fileSize = (maxSize: number) =>
    z.number().max(maxSize, `File size must be less than ${maxSize} bytes`);

  static fileType = (allowedTypes: string[]) =>
    z.string().refine(
      (val) => allowedTypes.includes(val),
      `File type must be one of: ${allowedTypes.join(', ')}`
    );

  static arrayLength = (min: number, max?: number) =>
    z.array(z.unknown()).refine(
      (arr) => {
        if (arr.length < min) return false;
        if (max !== undefined && arr.length > max) return false;
        return true;
      },
      `Array length must be between ${min} and ${max || 'unlimited'}`
    );

  static uniqueArray = <T>(arr: T[]) =>
    z.array(z.unknown()).refine(
      (val) => val.length === new Set(val).size,
      'Array must contain unique values'
    );

  static conditional = <T>(
    condition: (data: unknown) => boolean,
    schema: z.ZodSchema<T>
  ) =>
    z.unknown().refine(
      (val) => {
        if (!condition(val)) return true;
        return schema.safeParse(val).success;
      },
      'Conditional validation failed'
    );

  static async = <T>(
    validator: (value: unknown) => Promise<boolean>,
    message: string
  ) =>
    z.unknown().refine(
      async (val) => await validator(val),
      message
    );
}

// Schema Builder
export class SchemaBuilder<T = unknown> {
  private schema: z.ZodSchema<T>;
  private rules: ValidationRule[] = [];
  private options: ValidationOptions = {};

  constructor(schema?: z.ZodSchema<T>) {
    this.schema = schema || z.unknown();
  }

  addRule<K>(rule: ValidationRule<K>): this {
    this.rules.push(rule);
    return this;
  }

  setOptions(options: ValidationOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  build(): z.ZodSchema<T> {
    let finalSchema = this.schema;

    // Apply custom rules
    for (const rule of this.rules) {
      finalSchema = finalSchema.refine(
        (data) => {
          const value = this.getNestedValue(data, rule.field);
          return rule.validator(value);
        },
        {
          message: rule.message,
          path: rule.field.split('.')
        }
      );
    }

    return finalSchema;
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (!TypeGuards.isPlainObject(current) || !(key in current)) {
        return undefined;
      }
      current = (current as any)[key];
    }

    return current;
  }
}

// Validation Engine
export class ValidationEngine {
  private schemas = new Map<string, z.ZodSchema>();
  private customValidators = new Map<string, (value: unknown) => boolean>();

  registerSchema<T>(name: string, schema: z.ZodSchema<T>): void {
    this.schemas.set(name, schema);
  }

  registerCustomValidator(name: string, validator: (value: unknown) => boolean): void {
    this.customValidators.set(name, validator);
  }

  validate<T>(
    data: unknown,
    schema: z.ZodSchema<T> | string,
    options: ValidationOptions = {}
  ): ValidationResult<T> {
    try {
      const zodSchema = typeof schema === 'string' ? this.schemas.get(schema) : schema;

      if (!zodSchema) {
        return {
          success: false,
          errors: [{
            field: 'schema',
            message: 'Schema not found',
            code: 'SCHEMA_NOT_FOUND',
            path: []
          }],
          warnings: []
        };
      }

      const result = zodSchema.safeParse(data, {
        errorMap: this.createErrorMap(),
        ...options
      });

      if (result.success) {
        return {
          success: true,
          data: result.data,
          errors: [],
          warnings: []
        };
      } else {
        return {
          success: false,
          errors: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            value: err.input,
            path: err.path.map(String)
          })),
          warnings: []
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: 'validation',
          message: error instanceof Error ? error.message : 'Validation error',
          code: 'VALIDATION_ERROR',
          path: []
        }],
        warnings: []
      };
    }
  }

  validateAsync<T>(
    data: unknown,
    schema: z.ZodSchema<T> | string,
    options: ValidationOptions = {}
  ): Promise<ValidationResult<T>> {
    return Promise.resolve(this.validate(data, schema, options));
  }

  private createErrorMap(): z.ZodErrorMap {
    return (issue, ctx) => {
      switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
          return {
            message: `Expected ${issue.expected}, received ${issue.received}`
          };
        case z.ZodIssueCode.too_small:
          return {
            message: `Value is too small. Minimum: ${issue.minimum}`
          };
        case z.ZodIssueCode.too_big:
          return {
            message: `Value is too big. Maximum: ${issue.maximum}`
          };
        case z.ZodIssueCode.invalid_string:
          return {
            message: `Invalid string format`
          };
        case z.ZodIssueCode.custom:
          return {
            message: issue.message || 'Custom validation failed'
          };
        default:
          return {
            message: ctx.defaultError
          };
      }
    };
  }
}

// Predefined Schemas
export class PredefinedSchemas {
  static user = z.object({
    id: z.string().uuid(),
    email: CustomValidators.email,
    name: CustomValidators.nonEmptyString,
    role: z.enum(['admin', 'moderator', 'user', 'guest']),
    createdAt: z.date(),
    updatedAt: z.date(),
    isActive: z.boolean()
  });

  static userProfile = PredefinedSchemas.user.extend({
    avatar: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark', 'auto']),
      language: z.string(),
      timezone: z.string()
    }).optional()
  });

  static project = z.object({
    id: z.string().uuid(),
    name: CustomValidators.nonEmptyString,
    description: z.string().optional(),
    type: z.enum(['business', 'academic', 'personal', 'research', 'development']),
    status: z.enum(['draft', 'active', 'completed', 'archived', 'cancelled']),
    ownerId: z.string().uuid(),
    teamId: z.string().uuid().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    dueDate: z.date().optional(),
    tags: z.array(z.string()).default([]),
    metadata: z.record(z.unknown()).optional()
  });

  static team = z.object({
    id: z.string().uuid(),
    name: CustomValidators.nonEmptyString,
    description: z.string().optional(),
    ownerId: z.string().uuid(),
    members: z.array(z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
      name: CustomValidators.nonEmptyString,
      email: CustomValidators.email,
      role: z.enum(['owner', 'admin', 'member', 'viewer']),
      joinedAt: z.date(),
      permissions: z.array(z.enum(['read', 'write', 'delete', 'invite', 'manage']))
    })),
    createdAt: z.date(),
    updatedAt: z.date(),
    settings: z.object({
      visibility: z.enum(['public', 'private', 'invite-only']),
      allowMemberInvites: z.boolean(),
      requireApproval: z.boolean(),
      defaultRole: z.enum(['owner', 'admin', 'member', 'viewer'])
    })
  });

  static fileUpload = z.object({
    filename: CustomValidators.nonEmptyString,
    originalName: CustomValidators.nonEmptyString,
    mimeType: z.string(),
    size: CustomValidators.positiveNumber,
    url: CustomValidators.url,
    uploadedBy: z.string().uuid(),
    uploadedAt: z.date(),
    metadata: z.record(z.unknown()).optional()
  });

  static searchRequest = z.object({
    query: z.string().optional(),
    filters: z.record(z.unknown()).optional(),
    sort: z.object({
      field: z.string(),
      direction: z.enum(['asc', 'desc'])
    }).optional(),
    pagination: z.object({
      page: CustomValidators.positiveInteger,
      limit: CustomValidators.positiveInteger.max(100)
    }).optional()
  });

  static apiResponse = z.object({
    data: z.unknown(),
    status: CustomValidators.positiveInteger,
    message: z.string().optional(),
    success: z.boolean(),
    timestamp: z.string(),
    requestId: z.string().optional()
  });

  static apiError = z.object({
    message: CustomValidators.nonEmptyString,
    code: CustomValidators.nonEmptyString,
    status: CustomValidators.positiveInteger,
    details: z.record(z.unknown()).optional(),
    timestamp: z.string(),
    requestId: z.string().optional()
  });
}

// Validation Decorators
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0] as Request;
      const body = await request.json();

      const result = schema.safeParse(body);
      if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`);
      }

      return originalMethod.apply(this, [request, result.data, ...args.slice(2)]);
    };

    return descriptor;
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0] as Request;
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams);

      const result = schema.safeParse(query);
      if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`);
      }

      return originalMethod.apply(this, [request, result.data, ...args.slice(2)]);
    };

    return descriptor;
  };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const params = args[1] as Record<string, string>;

      const result = schema.safeParse(params);
      if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`);
      }

      return originalMethod.apply(this, [args[0], result.data, ...args.slice(2)]);
    };

    return descriptor;
  };
}

// Global validation engine instance
export const validationEngine = new ValidationEngine();

// Register predefined schemas
Object.entries(PredefinedSchemas).forEach(([name, schema]) => {
  validationEngine.registerSchema(name, schema);
});
