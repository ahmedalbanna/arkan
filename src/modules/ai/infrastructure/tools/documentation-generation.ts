import { ai } from '../services/Genkit';
import { ApiDocumentationSchema } from './schemas';

/**
 * @fileOverview Documentation Generation Tools
 */

export const createUserGuideTool = ai.defineTool(
    {
        name: 'createUserGuide',
        description: 'Generates a user guide for the provided code or feature.',
        inputSchema: ApiDocumentationSchema,
    },
    async (input: any) => ({ document: 'User guide content...' })
);

export const generateAPIReferenceTool = ai.defineTool(
    {
        name: 'generateAPIReference',
        description: 'Generates API reference documentation from code comments.',
        inputSchema: ApiDocumentationSchema,
    },
    async (input: any) => ({ document: 'API reference content...' })
);

export const documentationGenerationTools = {
    createUserGuideTool,
    generateAPIReferenceTool,
};
