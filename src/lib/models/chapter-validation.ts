/**
 * Validation utilities and schemas for Chapter model
 * 
 * This module provides Zod schemas and validation helpers to ensure
 * Chapter data integrity and consistency.
 */

import { z } from 'zod';

/**
 * Chapter properties schema
 */
export const ChapterPropertiesSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Chapter title is required').max(500, 'Chapter title too long'),
  sections: z.array(z.any()).optional(), // Complex validation handled separately
});

/**
 * Validation error class for Chapter model
 */
export class ChapterValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly errors?: z.ZodError
  ) {
    super(message);
    this.name = 'ChapterValidationError';
  }
}

/**
 * Validates chapter properties against schema
 * 
 * @param props - Chapter properties to validate
 * @returns Validated properties
 * @throws {ChapterValidationError} If validation fails
 */
export function validateChapterProperties(props: unknown): z.infer<typeof ChapterPropertiesSchema> {
  try {
    return ChapterPropertiesSchema.parse(props);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ChapterValidationError(
        `Chapter validation failed: ${firstError?.message || 'Invalid data'}`,
        firstError?.path.join('.'),
        error
      );
    }
    throw error;
  }
}

/**
 * Checks for duplicate section IDs within a chapter
 * 
 * @param sections - Array of sections with IDs
 * @returns Array of duplicate IDs found
 */
export function findDuplicateSectionIds(sections: Array<{ id: string }>): string[] {
  const ids = new Set<string>();
  const duplicates = new Set<string>();
  
  sections.forEach(section => {
    if (ids.has(section.id)) {
      duplicates.add(section.id);
    }
    ids.add(section.id);
  });
  
  return Array.from(duplicates);
}

/**
 * Validates that all section IDs are unique within a chapter
 * 
 * @param sections - Sections to check
 * @throws {ChapterValidationError} If duplicate IDs found
 */
export function validateUniqueSectionIds(sections: Array<{ id: string }>): void {
  const duplicates = findDuplicateSectionIds(sections);
  
  if (duplicates.length > 0) {
    throw new ChapterValidationError(
      `Duplicate section IDs found in chapter: ${duplicates.join(', ')}`,
      'sections'
    );
  }
}
