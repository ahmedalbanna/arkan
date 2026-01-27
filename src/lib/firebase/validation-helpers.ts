import { z } from 'zod';
import {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserValidationError,
  ProjectSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectValidationError,
  SectionSchema,
  CreateSectionSchema,
  UpdateSectionSchema,
  SectionValidationError,
  TemplateSchema,
  CreateTemplateSchema,
  UpdateTemplateSchema,
  TemplateValidationError,
  TransactionSchema,
  CreateTransactionSchema,
  UpdateTransactionSchema,
  TransactionValidationError,
  NotificationSchema,
  CreateNotificationSchema,
  UpdateNotificationSchema,
  NotificationValidationError,
  AgentSchema,
  CreateAgentSchema,
  UpdateAgentSchema,
  AgentValidationError,
} from './schemas';

/**
 * Validation Helpers for Firebase Collections
 * 
 * Provides safe, user-friendly validation functions for all Firestore operations.
 * Each function returns validated data or throws a descriptive error.
 * 
 * @module firebase/validation-helpers
 */

// ============================================================================
// USER VALIDATION HELPERS
// ============================================================================

/**
 * Validate complete user object
 */
export function validateUser(data: unknown) {
  try {
    return UserSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new UserValidationError(
        `User validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate user for creation (no ID, timestamps)
 */
export function validateCreateUser(data: unknown) {
  try {
    return CreateUserSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new UserValidationError(
        `User creation validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate user for update (partial fields allowed)
 */
export function validateUpdateUser(data: unknown) {
  try {
    return UpdateUserSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new UserValidationError(
        `User update validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate credit amount
 */
export function validateCredits(credits: number): void {
  if (credits < 0) {
    throw new UserValidationError('Credits cannot be negative', 'credits');
  }
  if (!Number.isInteger(credits)) {
    throw new UserValidationError('Credits must be an integer', 'credits');
  }
}

// ============================================================================
// PROJECT VALIDATION HELPERS
// ============================================================================

/**
 * Validate complete project object
 */
export function validateProject(data: unknown) {
  try {
    return ProjectSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ProjectValidationError(
        `Project validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate project for creation
 */
export function validateCreateProject(data: unknown) {
  try {
    return CreateProjectSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ProjectValidationError(
        `Project creation validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate project for update
 */
export function validateUpdateProject(data: unknown) {
  try {
    return UpdateProjectSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ProjectValidationError(
        `Project update validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Check for duplicate IDs in project content
 */
export function findDuplicateIds(
  content: Array<{ id: string; sections?: Array<{ id: string }> }>
): string[] {
  const ids = new Set<string>();
  const duplicates = new Set<string>();

  content.forEach((item) => {
    if (ids.has(item.id)) {
      duplicates.add(item.id);
    }
    ids.add(item.id);

    if (item.sections) {
      item.sections.forEach((section) => {
        if (ids.has(section.id)) {
          duplicates.add(section.id);
        }
        ids.add(section.id);
      });
    }
  });

  return Array.from(duplicates);
}

/**
 * Validate unique IDs in project content
 */
export function validateUniqueIds(
  content: Array<{ id: string; sections?: Array<{ id: string }> }>
): void {
  const duplicates = findDuplicateIds(content);
  if (duplicates.length > 0) {
    throw new ProjectValidationError(
      `Duplicate IDs found in project content: ${duplicates.join(', ')}`,
      'content'
    );
  }
}

/**
 * Validate external context references
 */
export function validateExternalContextReferences(
  sectionContext: Record<string, unknown>,
  availableContextIds: string[]
): string[] {
  const contextIds = Object.keys(sectionContext);
  const availableSet = new Set(availableContextIds);
  return contextIds.filter((id) => !availableSet.has(id));
}

/**
 * Validate section references
 */
export function validateSectionReferences(
  sectionContext: Record<string, unknown>,
  availableSectionIds: string[]
): string[] {
  const contextIds = Object.keys(sectionContext);
  const availableSet = new Set(availableSectionIds);
  return contextIds.filter((id) => !availableSet.has(id));
}

// ============================================================================
// SECTION VALIDATION HELPERS
// ============================================================================

/**
 * Validate complete section object
 */
export function validateSection(data: unknown) {
  try {
    return SectionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new SectionValidationError(
        `Section validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate section for creation
 */
export function validateCreateSection(data: unknown) {
  try {
    return CreateSectionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new SectionValidationError(
        `Section creation validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate section for update
 */
export function validateUpdateSection(data: unknown) {
  try {
    return UpdateSectionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new SectionValidationError(
        `Section update validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

// ============================================================================
// TEMPLATE VALIDATION HELPERS
// ============================================================================

/**
 * Validate complete template object
 */
export function validateTemplate(data: unknown) {
  try {
    return TemplateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new TemplateValidationError(
        `Template validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate template for creation
 */
export function validateCreateTemplate(data: unknown) {
  try {
    return CreateTemplateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new TemplateValidationError(
        `Template creation validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate template for update
 */
export function validateUpdateTemplate(data: unknown) {
  try {
    return UpdateTemplateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new TemplateValidationError(
        `Template update validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

// ============================================================================
// TRANSACTION VALIDATION HELPERS
// ============================================================================

/**
 * Validate complete transaction object
 */
export function validateTransaction(data: unknown) {
  try {
    return TransactionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new TransactionValidationError(
        `Transaction validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate transaction for creation
 */
export function validateCreateTransaction(data: unknown) {
  try {
    return CreateTransactionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new TransactionValidationError(
        `Transaction creation validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate transaction for update
 */
export function validateUpdateTransaction(data: unknown) {
  try {
    return UpdateTransactionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new TransactionValidationError(
        `Transaction update validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate transaction status
 */
export function validateTransactionStatus(status: string): void {
  const validStatuses = ['pending', 'verified', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new TransactionValidationError(
      `Invalid transaction status: ${status}. Must be one of: ${validStatuses.join(', ')}`,
      'status'
    );
  }
}

// ============================================================================
// NOTIFICATION VALIDATION HELPERS
// ============================================================================

/**
 * Validate complete notification object
 */
export function validateNotification(data: unknown) {
  try {
    return NotificationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new NotificationValidationError(
        `Notification validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate notification for creation
 */
export function validateCreateNotification(data: unknown) {
  try {
    return CreateNotificationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new NotificationValidationError(
        `Notification creation validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate notification for update
 */
export function validateUpdateNotification(data: unknown) {
  try {
    return UpdateNotificationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new NotificationValidationError(
        `Notification update validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

// ============================================================================
// AGENT VALIDATION HELPERS
// ============================================================================

/**
 * Validate complete agent object
 */
export function validateAgent(data: unknown) {
  try {
    return AgentSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new AgentValidationError(
        `Agent validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate agent for creation
 */
export function validateCreateAgent(data: unknown) {
  try {
    return CreateAgentSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new AgentValidationError(
        `Agent creation validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Validate agent for update
 */
export function validateUpdateAgent(data: unknown) {
  try {
    return UpdateAgentSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new AgentValidationError(
        `Agent update validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

// ============================================================================
// SAFE PARSING UTILITIES (without throwing)
// ============================================================================

/**
 * Safely parse data without throwing - returns [data, error] tuple
 */
export function safeParseUser(data: unknown): [typeof data | null, UserValidationError | null] {
  try {
    return [validateUser(data), null];
  } catch (error) {
    return [null, error instanceof UserValidationError ? error : new UserValidationError(String(error))];
  }
}

/**
 * Safely parse project data without throwing
 */
export function safeParseProject(data: unknown): [typeof data | null, ProjectValidationError | null] {
  try {
    return [validateProject(data), null];
  } catch (error) {
    return [null, error instanceof ProjectValidationError ? error : new ProjectValidationError(String(error))];
  }
}

/**
 * Safely parse notification data without throwing
 */
export function safeParseNotification(data: unknown): [typeof data | null, NotificationValidationError | null] {
  try {
    return [validateNotification(data), null];
  } catch (error) {
    return [null, error instanceof NotificationValidationError ? error : new NotificationValidationError(String(error))];
  }
}

/**
 * Safely parse transaction data without throwing
 */
export function safeParseTransaction(data: unknown): [typeof data | null, TransactionValidationError | null] {
  try {
    return [validateTransaction(data), null];
  } catch (error) {
    return [null, error instanceof TransactionValidationError ? error : new TransactionValidationError(String(error))];
  }
}
