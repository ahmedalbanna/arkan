import { z } from 'zod';
import { ExternalContextTypeSchema, TargetAudienceSchema, ToneSchema } from './enums';

// ============================================================================
// BASE SCHEMAS
// ============================================================================


// Base schema for prompt
export const BasePromptSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters.')
});

/**
 * Base schema for flows that take a single string of text as input.
 */
export const BaseTextInputSchema = z.object({
  text: z.string().min(1, 'Input text cannot be empty.'),
});


/**
 * Base schema for flows that accept a file as a data URI.
 */
export const BaseDataUriInputSchema = z.object({
  dataUri: z.string().url().startsWith('data:', 'Input must be a valid data URI.'),
});

// Base schema for external context files used across flows
export const BaseContextFileSchema = z.object({
  fileName: z.string().min(1),
  content: z.string().min(1),
  type: ExternalContextTypeSchema,
});

// Reusable external context container
export const BaseExternalContextSchema = z.object({
  externalContext: z.array(BaseContextFileSchema).optional().describe('An array of external documents (text or data URIs) provided by the user.'),
});

// Common generation controls (kept minimal to avoid breaking existing flows)
export const BaseControlsSchema = z
  .object({
    guidelines: z.array(z.string()).optional().describe('A list of specific guidelines for the agent to follow.'),
    instructionText: z
      .string()
      .optional()
      .describe('Additional instructions for generation (e.g., tone, formality).'),
    targetAudience: TargetAudienceSchema.optional().describe('The intended audience for the content.'),
    tone: ToneSchema.optional().describe('Desired tone (e.g., professional, casual, persuasive).'),
  })
  .strict();

// Common optional web search controls
export const BaseWebSearchSchema = z
  .object({
    useWebSearch: z
      .boolean()
      .optional()
      .default(false)
      .describe('Whether to search the web for additional information.'),
    maxSources: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe('Maximum number of sources to use (only if useWebSearch is true).'),
  });

// Simple normalized text input (not yet used in refactors but provided for reuse)
export const BaseTextSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').transform((s) => s.trim()),
});


// Common combined generation schema (external context + generation controls)
export const BaseGenerationSchema = BaseExternalContextSchema.merge(BaseControlsSchema);

export type BaseContextFile = z.infer<typeof BaseContextFileSchema>;
