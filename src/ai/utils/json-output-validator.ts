/**
 * @fileOverview Utility functions for validating and cleaning JSON output from AI models
 * Especially useful for small models like ollama/gemma:2b that may not strictly follow JSON format
 */

import { z } from 'zod';

/**
 * Options for JSON output validation
 */
export interface JsonValidationOptions<T> {
  /**
   * The Zod schema to validate against
   */
  schema: z.ZodType<T>;
  
  /**
   * The raw output from the AI model
   */
  output: unknown;
  
  /**
   * Name of the flow (for logging purposes)
   */
  flowName?: string;
  
  /**
   * Whether to attempt automatic recovery/cleaning
   * @default true
   */
  attemptRecovery?: boolean;
  
  /**
   * Whether to log validation errors
   * @default true
   */
  enableLogging?: boolean;
  
  /**
   * Custom fallback function if all recovery attempts fail
   * If not provided and recovery fails, an error will be thrown
   */
  fallbackFn?: (rawOutput: unknown) => T | null;
}

/**
 * Result of JSON validation
 */
export interface JsonValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  recovered: boolean;
  recoveryMethod?: 'direct' | 'cleaned' | 'parsed' | 'fallback';
}

/**
 * Clean markdown code blocks and extra formatting from JSON strings
 */
function cleanJsonString(str: string): string {
  return str
    // Remove markdown JSON code blocks
    .replace(/^```json\s*/i, '')
    .replace(/^```javascript\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    // Remove potential "json" or "JSON" prefix
    .replace(/^json\s*/i, '')
    .replace(/^JSON\s*/i, '')
    // Trim whitespace
    .trim();
}

/**
 * Attempt to extract JSON from text that may contain extra content
 */
function extractJsonFromText(text: string): string | null {
  // Try to find JSON object boundaries
  const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    return jsonObjectMatch[0];
  }
  
  // Try to find JSON array boundaries
  const jsonArrayMatch = text.match(/\[[\s\S]*\]/);
  if (jsonArrayMatch) {
    return jsonArrayMatch[0];
  }
  
  return null;
}

/**
 * Validate and clean JSON output from AI models
 * 
 * @example
 * ```typescript
 * const result = await validateJsonOutput({
 *   schema: MyOutputSchema,
 *   output: modelOutput,
 *   flowName: 'myFlow',
 * });
 * 
 * if (result.success) {
 *   return result.data;
 * } else {
 *   throw new Error(result.error);
 * }
 * ```
 */
export function validateJsonOutput<T>(
  options: JsonValidationOptions<T>
): JsonValidationResult<T> {
  const {
    schema,
    output,
    flowName = 'unknown',
    attemptRecovery = true,
    enableLogging = true,
    fallbackFn,
  } = options;

  // Step 1: Try direct validation
  const directValidation = schema.safeParse(output);
  if (directValidation.success) {
    if (enableLogging) {
      console.log(`[${flowName}] ✅ Direct validation successful`);
    }
    return {
      success: true,
      data: directValidation.data,
      recovered: false,
      recoveryMethod: 'direct',
    };
  }

  if (enableLogging) {
    console.warn(`[${flowName}] ⚠️ Direct validation failed:`, directValidation.error.message);
    console.log(`[${flowName}] Received output type:`, typeof output);
  }

  if (!attemptRecovery) {
    return {
      success: false,
      error: `Validation failed: ${directValidation.error.message}`,
      recovered: false,
    };
  }

  // Step 2: If output is a string, try to clean and parse it
  if (typeof output === 'string') {
    if (enableLogging) {
      console.log(`[${flowName}] 🔧 Attempting to clean string output...`);
    }

    try {
      // Clean the string
      const cleaned = cleanJsonString(output);
      
      // Try to parse the cleaned string
      const parsed = JSON.parse(cleaned);
      const cleanedValidation = schema.safeParse(parsed);
      
      if (cleanedValidation.success) {
        if (enableLogging) {
          console.log(`[${flowName}] ✅ Successfully cleaned and validated output`);
        }
        return {
          success: true,
          data: cleanedValidation.data,
          recovered: true,
          recoveryMethod: 'cleaned',
        };
      }
    } catch (parseError) {
      if (enableLogging) {
        console.warn(`[${flowName}] Failed to parse cleaned string:`, parseError);
      }
    }

    // Step 3: Try to extract JSON from the string
    try {
      if (enableLogging) {
        console.log(`[${flowName}] 🔍 Attempting to extract JSON from text...`);
      }
      
      const extracted = extractJsonFromText(output);
      if (extracted) {
        const parsed = JSON.parse(extracted);
        const extractedValidation = schema.safeParse(parsed);
        
        if (extractedValidation.success) {
          if (enableLogging) {
            console.log(`[${flowName}] ✅ Successfully extracted and validated JSON`);
          }
          return {
            success: true,
            data: extractedValidation.data,
            recovered: true,
            recoveryMethod: 'parsed',
          };
        }
      }
    } catch (extractError) {
      if (enableLogging) {
        console.warn(`[${flowName}] Failed to extract JSON:`, extractError);
      }
    }
  }

  // Step 4: Try custom fallback function
  if (fallbackFn) {
    if (enableLogging) {
      console.log(`[${flowName}] 🔄 Attempting custom fallback...`);
    }
    
    try {
      const fallbackResult = fallbackFn(output);
      if (fallbackResult !== null) {
        const fallbackValidation = schema.safeParse(fallbackResult);
        if (fallbackValidation.success) {
          if (enableLogging) {
            console.log(`[${flowName}] ✅ Fallback successful`);
          }
          return {
            success: true,
            data: fallbackValidation.data,
            recovered: true,
            recoveryMethod: 'fallback',
          };
        }
      }
    } catch (fallbackError) {
      if (enableLogging) {
        console.warn(`[${flowName}] Fallback failed:`, fallbackError);
      }
    }
  }

  // Step 5: All recovery attempts failed
  if (enableLogging) {
    console.error(`[${flowName}] ❌ All validation and recovery attempts failed`);
    console.error(`[${flowName}] Final output:`, output);
  }

  return {
    success: false,
    error: `All validation attempts failed. Original error: ${directValidation.error.message}`,
    recovered: false,
  };
}

/**
 * Generate improved prompt instructions for JSON output
 * Add this to your prompts to improve JSON compliance
 */
export function getJsonPromptInstructions(schemaExample: string): string {
  return `You MUST respond with ONLY a valid JSON object.

**CRITICAL INSTRUCTIONS:**
1. Your ENTIRE response must be a valid JSON object
2. Do NOT include any text before or after the JSON
3. Do NOT use markdown code blocks or backticks
4. Follow this EXACT structure:
${schemaExample}

**Important:** Output ONLY the JSON object, no explanations or extra text.`;
}

/**
 * Recommended temperature settings for different task types
 */
export const RECOMMENDED_TEMPERATURES = {
  /** For tasks requiring high precision and structure adherence (JSON output, data extraction) */
  PRECISE: 0.2,
  
  /** For tasks requiring accuracy with some flexibility (summarization, classification) */
  BALANCED: 0.5,
  
  /** For creative tasks (content generation, brainstorming) */
  CREATIVE: 0.8,
} as const;

/**
 * Helper to create a complete prompt with JSON instructions
 */
export function createJsonPrompt(params: {
  systemRole: string;
  task: string;
  schemaExample: string;
  inputVariables: string;
  additionalInstructions?: string;
}): string {
  const { systemRole, task, schemaExample, inputVariables, additionalInstructions } = params;
  
  return `${systemRole}

${getJsonPromptInstructions(schemaExample)}

**Task:**
${task}

${additionalInstructions ? `**Additional Instructions:**\n${additionalInstructions}\n` : ''}
${inputVariables}

**JSON Output:**`;
}
