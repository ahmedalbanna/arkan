/**
 * تدفقات المرئي
 * يحتوي على جميع التدفقات المتعلقة بالمحتوى المرئي والمخططات
 */

'use server';

import { ai } from '@/ai/genkit';
import { createGenkitFlow, FlowCategory } from './registry';

// استيراد المحفزات
import { generateDiagramPrompt } from '@/ai/prompts/generate-diagrams';
import { generatePlantUMLPrompt } from '@/ai/prompts/generate-plantuml';

// استيراد المخططات
import {
    GenerateDiagramInputSchema,
    GenerateDiagramOutputSchema,
    GeneratePlantUMLInputSchema,
    GeneratePlantUMLOutputSchema,
    type GenerateDiagramInput,
    type GenerateDiagramOutput,
    type GeneratePlantUMLInput,
    type GeneratePlantUMLOutput
} from '@/ai/schemas';

// ===== توليد المخططات =====
createGenkitFlow(
    'generate-diagram',
    'visual' as FlowCategory,
    'توليد المخططات والرسوم البيانية المختلفة',
    GenerateDiagramInputSchema,
    GenerateDiagramOutputSchema,
    async (input: GenerateDiagramInput) => {
        const { output } = await generateDiagramPrompt(input);
        if (!output) {
            throw new Error("Diagram generation failed.");
        }
        return output;
    }
);

// ===== توليد PlantUML =====
createGenkitFlow(
    'generate-plantuml',
    'visual' as FlowCategory,
    'توليد مخططات PlantUML للأنظمة والعمليات',
    GeneratePlantUMLInputSchema,
    GeneratePlantUMLOutputSchema,
    async (input: GeneratePlantUMLInput) => {
        const { output } = await generatePlantUMLPrompt(input);
        if (!output) {
            throw new Error("PlantUML generation failed.");
        }
        return output;
    }
);

// ===== تصدير الدوال للاستخدام الخارجي =====

export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
    const validation = GenerateDiagramInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generateDiagram: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generateDiagramFlow',
        inputSchema: GenerateDiagramInputSchema,
        outputSchema: GenerateDiagramOutputSchema
    }, async (input) => {
        const { output } = await generateDiagramPrompt(input);
        if (!output) throw new Error("Diagram generation failed.");
        return output;
    })(validation.data);
}

export async function generatePlantUML(input: GeneratePlantUMLInput): Promise<GeneratePlantUMLOutput> {
    const validation = GeneratePlantUMLInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for generatePlantUML: ${validation.error.message}`);
    }
    return ai.defineFlow({
        name: 'generatePlantUMLFlow',
        inputSchema: GeneratePlantUMLInputSchema,
        outputSchema: GeneratePlantUMLOutputSchema
    }, async (input) => {
        const { output } = await generatePlantUMLPrompt(input);
        if (!output) throw new Error("PlantUML generation failed.");
        return output;
    })(validation.data);
}
