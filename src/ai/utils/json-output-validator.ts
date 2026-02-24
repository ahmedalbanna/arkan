
import { z } from 'zod';

export const RECOMMENDED_TEMPERATURES = {
    PRECISE: 0.1,
    BALANCED: 0.5,
    CREATIVE: 0.8,
};

export function getJsonPromptInstructions(schema: z.ZodType<any>): string {
    return `Output MUST be a valid JSON object matching this schema: ${JSON.stringify((schema as any)._def)}. Do not include any other text.`;
}

export function validateJsonOutput<T>(text: string, schema: z.ZodType<T>): T {
    try {
        const json = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
        return schema.parse(json);
    } catch (error) {
        console.error("JSON Validation Error:", error, "Raw text:", text);
        throw new Error("Failed to parse AI output as valid JSON.");
    }
}
