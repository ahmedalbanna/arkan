/**
 * Content validation and sanitization utilities
 */

import { ContextLimits } from '@/types';
import { logger } from './logger';

/**
 * Default context size limits
 */
export const DEFAULT_CONTEXT_LIMITS: ContextLimits = {
  maxContextSize: 5 * 1024 * 1024, // 5MB total context
  maxExternalFiles: 10,
  maxSectionReferences: 20,
};

/**
 * Calculate byte size of a string
 */
function getByteSize(str: string): number {
  return new Blob([str]).size;
}

/**
 * Validate context size doesn't exceed limits
 */
export function validateContextSize(
  context: Record<string, string>,
  externalContext: Array<{ title: string; content: string }>,
  limits: ContextLimits = DEFAULT_CONTEXT_LIMITS
): { valid: boolean; error?: string; totalSize: number } {
  // Calculate total context size
  const contextSize = Object.values(context).reduce(
    (sum, content) => sum + getByteSize(content),
    0
  );
  
  const externalSize = externalContext.reduce(
    (sum, item) => sum + getByteSize(item.content),
    0
  );
  
  const totalSize = contextSize + externalSize;
  
  // Check total size
  if (totalSize > limits.maxContextSize) {
    return {
      valid: false,
      error: `Context size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum (${(limits.maxContextSize / 1024 / 1024).toFixed(2)}MB)`,
      totalSize,
    };
  }
  
  // Check number of section references
  if (Object.keys(context).length > limits.maxSectionReferences) {
    return {
      valid: false,
      error: `Too many section references (${Object.keys(context).length}). Maximum is ${limits.maxSectionReferences}`,
      totalSize,
    };
  }
  
  // Check number of external files
  if (externalContext.length > limits.maxExternalFiles) {
    return {
      valid: false,
      error: `Too many external files (${externalContext.length}). Maximum is ${limits.maxExternalFiles}`,
      totalSize,
    };
  }
  
  return { valid: true, totalSize };
}

/**
 * Sanitize text content for AI processing
 * Removes potentially problematic characters while preserving formatting
 */
export function sanitizeContent(content: string): string {
  if (!content) return '';
  
  let sanitized = content;
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Normalize line endings
  sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Remove excessive whitespace (but preserve paragraph breaks)
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim leading/trailing whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitize context record
 */
export function sanitizeContext(context: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(context)) {
    sanitized[key] = sanitizeContent(value);
  }
  
  return sanitized;
}

/**
 * Sanitize external context array
 */
export function sanitizeExternalContext(
  externalContext: Array<{ title: string; content: string }>
): Array<{ title: string; content: string }> {
  return externalContext.map(item => ({
    title: sanitizeContent(item.title),
    content: sanitizeContent(item.content),
  }));
}

/**
 * Validate and sanitize all input for section generation
 */
export function validateAndSanitizeInput(input: {
  context: Record<string, string>;
  externalContext: Array<{ title: string; content: string }>;
  sectionToGenerate: string;
  prompt: string;
}): {
  valid: boolean;
  error?: string;
  sanitized?: typeof input;
  contextSize?: number;
} {
  // Validate context size
  const sizeValidation = validateContextSize(input.context, input.externalContext);
  
  if (!sizeValidation.valid) {
    logger.warn(`Context validation failed: ${sizeValidation.error}`);
    return {
      valid: false,
      error: sizeValidation.error,
      contextSize: sizeValidation.totalSize,
    };
  }
  
  // Sanitize all content
  const sanitized = {
    context: sanitizeContext(input.context),
    externalContext: sanitizeExternalContext(input.externalContext),
    sectionToGenerate: sanitizeContent(input.sectionToGenerate),
    prompt: sanitizeContent(input.prompt),
  };
  
  logger.info(`Input validated and sanitized. Context size: ${(sizeValidation.totalSize / 1024).toFixed(2)}KB`);
  
  return {
    valid: true,
    sanitized,
    contextSize: sizeValidation.totalSize,
  };
}
