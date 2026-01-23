/**
 * Type definitions for AI generation system
 */

import { GenerateSectionInputSchema } from '@/ai/schemas';
import { z } from 'zod';
// Old schema removed - now using unified generation
// import { GenerateSectionInputSchema } from '@/ai/flows/generate-report-section';

/**
 * Input for generating a single section
 */
export type GenerateSectionInput = z.infer<typeof GenerateSectionInputSchema>;

/**
 * Response from section generation
 */
export interface GenerateSectionResponse {
  /** The section ID as key, generated content as value */
  [sectionId: string]: string;
}

/**
 * API response wrapper for section generation
 */
export interface GenerateSectionApiResponse {
  success: boolean;
  data?: GenerateSectionResponse;
  error?: string;
}

/**
 * Configuration for AI model selection
 */
export interface ModelConfig {
  /** Model identifier (e.g., 'ollama/gemma:2b') */
  model: string;
  /** Temperature for generation (0.0-1.0) */
  temperature: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
}

/**
 * Section complexity levels for model selection
 */
export enum SectionComplexity {
  SIMPLE = 'simple',
  MEDIUM = 'medium',
  COMPLEX = 'complex',
  EXPERT = 'expert'
}

/**
 * Retry configuration for AI generation
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds */
  initialDelayMs: number;
  /** Maximum delay in milliseconds */
  maxDelayMs: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
}

/**
 * Generation attempt metadata
 */
export interface GenerationAttempt {
  attemptNumber: number;
  model: string;
  startTime: number;
  endTime?: number;
  success: boolean;
  error?: string;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  userId: string;
  requestCount: number;
  windowStart: number;
  windowEnd: number;
  limit: number;
}

/**
 * Generation context size limits
 */
export interface ContextLimits {
  maxContextSize: number; // bytes
  maxExternalFiles: number;
  maxSectionReferences: number;
}
