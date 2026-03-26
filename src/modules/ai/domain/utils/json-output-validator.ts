
import { z } from 'zod';

export const RECOMMENDED_TEMPERATURES = {
    PRECISE: 0.1,
    BALANCED: 0.5,
    CREATIVE: 0.8,
    ACADEMIC: 0.3,
    PROFESSIONAL: 0.4,
};

/**
 * Returns a prompt instruction string for JSON output.
 * @param jsonExample - A plain JSON example string showing the expected output shape.
 */
export function getJsonPromptInstructions(jsonExample: string): string {
    return `Your response MUST be a valid JSON object. Do not include any text outside the JSON block.
Expected JSON shape:
\`\`\`json
${jsonExample}
\`\`\``;
}

export interface ValidateJsonOutputOptions<T> {
    schema: z.ZodType<T>;
    output: unknown;
    flowName?: string;
    attemptRecovery?: boolean;
    enableLogging?: boolean;
    fallbackFn?: (rawOutput: unknown) => T | null;
}

export interface ValidateJsonOutputResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Validates and parses AI output against a Zod schema.
 */
export function validateJsonOutput<T>(options: ValidateJsonOutputOptions<T>): ValidateJsonOutputResult<T> {
    const { schema, output, flowName = 'unknown', attemptRecovery = false, enableLogging = false, fallbackFn } = options;

    // If output is already a valid object, try parsing directly
    const parsed = schema.safeParse(output);
    if (parsed.success) {
        return { success: true, data: parsed.data };
    }

    if (enableLogging) {
        console.warn(`[${flowName}] Schema validation failed:`, parsed.error.message);
    }

    // Attempt recovery by extracting JSON from a string
    if (attemptRecovery && typeof output === 'string') {
        try {
            const jsonMatch = output.match(/```json\n?([\s\S]*?)\n?```/) || output.match(/({[\s\S]*})/);
            if (jsonMatch) {
                const extracted = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                const reparsed = schema.safeParse(extracted);
                if (reparsed.success) {
                    if (enableLogging) console.log(`[${flowName}] Recovered JSON from string.`);
                    return { success: true, data: reparsed.data };
                }
            }
        } catch {
            // continue to fallback
        }
    }

    // Try fallback function
    if (fallbackFn) {
        const fallback = fallbackFn(output);
        if (fallback !== null && fallback !== undefined) {
            const fallbackParsed = schema.safeParse(fallback);
            if (fallbackParsed.success) {
                if (enableLogging) console.log(`[${flowName}] Used fallback function.`);
                return { success: true, data: fallbackParsed.data };
            }
        }
    }

    return { success: false, error: parsed.error.message };
}
