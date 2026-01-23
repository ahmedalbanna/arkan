/**
 * Validation utilities and schemas for User model
 * 
 * This module provides Zod schemas and validation helpers to ensure
 * User data integrity and consistency.
 */

import { z } from 'zod';

/**
 * User role types
 */
export const UserRoleSchema = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * User profile schema with all fields
 */
export const UserProfileSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  email: z.string().email('Invalid email address'),
  role: UserRoleSchema,
  credits: z.number().int().min(0, 'Credits cannot be negative').optional(),
  createdAt: z.string().datetime('Invalid ISO datetime').optional(),
  updatedAt: z.string().datetime('Invalid ISO datetime').optional(),
  bio: z.string().max(1000, 'Bio too long').optional(),
  profilePictureUrl: z.string().url('Invalid URL').or(z.string().length(0)).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
  apiKeys: z.record(z.string(), z.string()).optional(),
  lastDailyCreditUpdate: z.string().datetime('Invalid ISO datetime').optional(),
});

/**
 * Partial user properties for creation/updates
 */
export const UserPropertiesSchema = UserProfileSchema.partial().extend({
  id: z.string().optional(),
});

/**
 * Validation error class for User model
 */
export class UserValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly errors?: z.ZodError
  ) {
    super(message);
    this.name = 'UserValidationError';
  }
}

/**
 * Validates user properties against schema
 * 
 * @param props - User properties to validate
 * @returns Validated properties
 * @throws {UserValidationError} If validation fails
 */
export function validateUserProperties(props: unknown): z.infer<typeof UserPropertiesSchema> {
  try {
    return UserPropertiesSchema.parse(props);
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
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates user role
 */
export function isValidRole(role: string): role is UserRole {
  return role === 'admin' || role === 'user';
}

/**
 * Validates credit amount
 */
export function validateCredits(credits: number): void {
  if (credits < 0) {
    throw new UserValidationError('Credits cannot be negative', 'credits');
  }
  if (!Number.isInteger(credits)) {
    throw new UserValidationError('Credits must be an integer', 'credits');
  }
}
