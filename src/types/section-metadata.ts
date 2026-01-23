/**
 * Section metadata types for tracking generation status and history
 */

import { z } from 'zod';

/**
 * Section generation status
 */
export enum SectionStatus {
  DRAFT = 'draft',           // Not generated yet
  GENERATING = 'generating', // Currently being generated
  GENERATED = 'generated',   // Successfully generated
  FAILED = 'failed',        // Generation failed
  EDITED = 'edited',        // Manually edited after generation
}

/**
 * Schema for section metadata
 */
export const SectionMetadataSchema = z.object({
  status: z.nativeEnum(SectionStatus).optional(),
  createdAt: z.string().optional(),
  lastModifiedAt: z.string().optional(),
  generatedAt: z.string().optional(),
  generatedBy: z.enum(['ai', 'user']).optional(),
  aiModel: z.string().optional(),
  generationAttempts: z.number().optional(),
  wordCount: z.number().optional(),
  characterCount: z.number().optional(),
  estimatedReadTime: z.number().optional(), // in minutes
  version: z.number().optional(),
  previousVersions: z.array(z.object({
    content: z.string(),
    timestamp: z.string(),
    version: z.number(),
  })).optional(),
});

/**
 * Section metadata interface
 */
export interface SectionMetadata {
  status?: SectionStatus;
  createdAt?: string;
  lastModifiedAt?: string;
  generatedAt?: string;
  generatedBy?: 'ai' | 'user';
  aiModel?: string;
  generationAttempts?: number;
  wordCount?: number;
  characterCount?: number;
  estimatedReadTime?: number;
  version?: number;
  previousVersions?: Array<{
    content: string;
    timestamp: string;
    version: number;
  }>;
}

/**
 * Default metadata for new sections
 */
export const defaultSectionMetadata: SectionMetadata = {
  status: SectionStatus.DRAFT,
  createdAt: new Date().toISOString(),
  lastModifiedAt: new Date().toISOString(),
  version: 1,
  generationAttempts: 0,
  previousVersions: [],
};

/**
 * Calculate word count from content
 */
export function calculateWordCount(content: string): number {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculate character count from content
 */
export function calculateCharacterCount(content: string): number {
  if (!content) return 0;
  return content.length;
}

/**
 * Calculate estimated read time (average 200 words per minute)
 */
export function calculateReadTime(content: string): number {
  const wordCount = calculateWordCount(content);
  return Math.ceil(wordCount / 200);
}

/**
 * Create updated metadata after AI generation
 */
export function createGeneratedMetadata(
  currentMetadata: SectionMetadata,
  aiModel: string
): SectionMetadata {
  const now = new Date().toISOString();
  
  return {
    ...currentMetadata,
    status: SectionStatus.GENERATED,
    generatedAt: now,
    lastModifiedAt: now,
    generatedBy: 'ai',
    aiModel,
    generationAttempts: (currentMetadata.generationAttempts || 0) + 1,
  };
}

/**
 * Create updated metadata when content is manually edited
 */
export function createEditedMetadata(
  currentMetadata: SectionMetadata
): SectionMetadata {
  const now = new Date().toISOString();
  
  return {
    ...currentMetadata,
    status: SectionStatus.EDITED,
    lastModifiedAt: now,
    generatedBy: 'user',
  };
}

/**
 * Create updated metadata when generation starts
 */
export function createGeneratingMetadata(
  currentMetadata: SectionMetadata
): SectionMetadata {
  return {
    ...currentMetadata,
    status: SectionStatus.GENERATING,
    lastModifiedAt: new Date().toISOString(),
  };
}

/**
 * Create updated metadata when generation fails
 */
export function createFailedMetadata(
  currentMetadata: SectionMetadata
): SectionMetadata {
  return {
    ...currentMetadata,
    status: SectionStatus.FAILED,
    lastModifiedAt: new Date().toISOString(),
    generationAttempts: (currentMetadata.generationAttempts || 0) + 1,
  };
}

/**
 * Update content statistics in metadata
 */
export function updateContentStatistics(
  metadata: SectionMetadata,
  content: string
): SectionMetadata {
  return {
    ...metadata,
    wordCount: calculateWordCount(content),
    characterCount: calculateCharacterCount(content),
    estimatedReadTime: calculateReadTime(content),
  };
}

/**
 * Create version history entry
 */
export function addVersionToHistory(
  metadata: SectionMetadata,
  content: string
): SectionMetadata {
  const currentVersion = metadata.version || 1;
  const previousVersions = metadata.previousVersions || [];
  
  // Only keep last 5 versions
  const updatedVersions = [
    {
      content,
      timestamp: new Date().toISOString(),
      version: currentVersion,
    },
    ...previousVersions,
  ].slice(0, 5);
  
  return {
    ...metadata,
    version: currentVersion + 1,
    previousVersions: updatedVersions,
  };
}
