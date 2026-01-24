/**
 * Validation utilities and schemas for Project model
 *
 * This module provides Zod schemas and validation helpers to ensure
 * Project data integrity and consistency.
 */

import { z } from 'zod';
import { BehaviorSchema, CitationStyleSchema, LanguageSchema, ToneSchema } from './control-types';

/**
 * Metadata schema for project tracking
 */
export const ProjectMetaSchema = z.object({
  author: z.string().min(1, 'Author is required'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (e.g., 1.0.0)'),
  created: z.string().datetime('Invalid ISO datetime format'),
  updated: z.string().datetime('Invalid ISO datetime format'),
});

/**
 * Core Project Properties Schema
 */
export const ProjectPropertiesSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  projectDescription: z.string().max(5000, 'Project description too long').optional(),
  projectType: z.string().max(100).optional(),
  specialization: z.string().max(100).optional(),
  university: z.string().max(200).optional(),
  supervisor: z.string().max(200).optional(),
  course: z.string().max(200).optional(),
  educationalLevel: z.string().max(100).optional(),
  teamMembers: z.array(z.string().max(200)).optional(),
  logoUrl: z.string().url().or(z.string().length(0)).optional(),
  universityLogoUrl: z.string().url().or(z.string().length(0)).optional(),
  content: z.array(z.any()).optional(), // Complex validation handled separately
  externalContext: z.array(z.any()).optional(), // Complex validation handled separately
  meta: ProjectMetaSchema.optional(),
  tableOfContentsMarkdown: z.string().max(10000).optional(),
  activeSectionId: z.string().uuid().optional(),

  // Global settings
  language: LanguageSchema.optional(),
  complexity: z.number().min(0).max(100).optional(),
  formality: z.number().min(0).max(100).optional(),
  tone: ToneSchema.optional(),
  behaviors: z.array(BehaviorSchema).optional(),
  rules: z.array(z.string().max(500)).optional(),
  constraints: z.array(z.string().max(500)).optional(),
  citationStyle: CitationStyleSchema.optional(),
});

/**
 * Validation error types
 */
export class ProjectValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly errors?: z.ZodError
  ) {
    super(message);
    this.name = 'ProjectValidationError';
  }
}

/**
 * Validates project properties against schema
 *
 * @param props - Project properties to validate
 * @returns Validated properties
 * @throws {ProjectValidationError} If validation fails
 */
export function validateProjectProperties(props: unknown): z.infer<typeof ProjectPropertiesSchema> {
  try {
    return ProjectPropertiesSchema.parse(props);
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
 * Checks for duplicate IDs in content
 *
 * @param content - Array of chapters/sections with IDs
 * @returns Array of duplicate IDs found
 */
export function findDuplicateIds(content: Array<{ id: string; sections?: Array<{ id: string }> }>): string[] {
  const ids = new Set<string>();
  const duplicates = new Set<string>();

  content.forEach(item => {
    if (ids.has(item.id)) {
      duplicates.add(item.id);
    }
    ids.add(item.id);

    // Check nested sections
    if (item.sections) {
      item.sections.forEach(section => {
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
 * Validates that all IDs in project content are unique
 *
 * @param content - Project content to check
 * @throws {ProjectValidationError} If duplicate IDs found
 */
export function validateUniqueIds(content: Array<{ id: string; sections?: Array<{ id: string }> }>): void {
  const duplicates = findDuplicateIds(content);

  if (duplicates.length > 0) {
    throw new ProjectValidationError(
      `Duplicate IDs found in project content: ${duplicates.join(', ')}`,
      'content'
    );
  }
}

/**
 * Validates external context references
 *
 * @param sectionContext - Section context referencing external files
 * @param availableContextIds - IDs of available external context
 * @returns Array of invalid/missing context IDs
 */
export function validateExternalContextReferences(
  sectionContext: Record<string, any>,
  availableContextIds: string[]
): string[] {
  const contextIds = Object.keys(sectionContext);
  const availableSet = new Set(availableContextIds);

  return contextIds.filter(id => !availableSet.has(id));
}

/**
 * Validates section references in context
 *
 * @param sectionContext - Section context referencing other sections
 * @param availableSectionIds - IDs of available sections
 * @returns Array of invalid/missing section IDs
 */
export function validateSectionReferences(
  sectionContext: Record<string, any>,
  availableSectionIds: string[]
): string[] {
  const contextIds = Object.keys(sectionContext);
  const availableSet = new Set(availableSectionIds);

  return contextIds.filter(id => !availableSet.has(id));
}

/**
 * Partial validation for updates (allows partial data)
 */
export const PartialProjectPropertiesSchema = ProjectPropertiesSchema.partial();

/**
 * Validates partial project updates
 */
export function validatePartialProjectProperties(
  props: unknown
): Partial<z.infer<typeof ProjectPropertiesSchema>> {
  try {
    return PartialProjectPropertiesSchema.parse(props);
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
