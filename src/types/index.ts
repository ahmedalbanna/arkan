
import { type DecodedIdToken } from "firebase-admin/auth";
import { type NextRequest } from "next/server";

/**
 * Extends the standard NextRequest to include the authenticated user object.
 * This provides type safety for middleware-authenticated routes.
 */
export interface AppNextRequest extends NextRequest {
  user: DecodedIdToken;
}

// Re-export generation types (legacy)
export type {
  GenerateSectionInput,
  GenerateSectionResponse,
  GenerateSectionApiResponse,
  ModelConfig,
  RetryConfig,
  GenerationAttempt,
  RateLimitInfo,
  ContextLimits,
} from './generation';

export { SectionComplexity } from './generation';

// Simplified flows removed - now using unified generation
// See: src/ai/schemas/unified-generation.ts

// Re-export section metadata types
export type {
  SectionMetadata,
} from './section-metadata';

export {
  SectionStatus,
  SectionMetadataSchema,
  defaultSectionMetadata,
  calculateWordCount,
  calculateCharacterCount,
  calculateReadTime,
  createGeneratedMetadata,
  createEditedMetadata,
  createGeneratingMetadata,
  createFailedMetadata,
  updateContentStatistics,
  addVersionToHistory,
} from './section-metadata';
