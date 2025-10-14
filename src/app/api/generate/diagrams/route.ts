/**
 * API Route لتوليد المخططات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { generateDiagram } from '@/ai/flows/unified';
import { DiagramTypeSchema, ExternalContextSchema, ProjectPlanSchema, ProjectProposalSchema, SectionNameSchema } from '@/ai/schemas';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { deflateSync } from 'zlib';
import { z } from 'zod';

// Schema لطلب توليد مخطط جديد
const generateDiagramSchema = z.object({
    proposal: ProjectProposalSchema.optional().nullable(),
    projectPlan: ProjectPlanSchema.optional().nullable(),
    diagramToGenerate: DiagramTypeSchema.describe("The type of diagram to generate."),
    otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context."),
    otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context."),
    guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
    externalContext: z.array(ExternalContextSchema).optional().describe("An array of external documents (text or data URIs) provided by the user."),
    instructionText: z.string().optional().describe("Additional instructions for generation (e.g., tone, formality)."),
});

// Schema لتحديث مخطط موجود
const updateDiagramSchema = z.object({
    intent: z.literal('update_diagram'),
    plantUmlCode: z.string().min(1, 'PlantUML code is required for an update.'),
});

// Schema موحد للطلبات
const unifiedDiagramSchema = z.union([generateDiagramSchema, updateDiagramSchema]);

// دالة مساعدة لتشفير PlantUML للـ URL
function encode64(data: Buffer): string {
    const B64_MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
    let r = '';
    for (let i = 0; i < data.length; i += 3) {
        const b1 = data[i];
        const b2 = i + 1 < data.length ? data[i + 1] : 0;
        const b3 = i + 2 < data.length ? data[i + 2] : 0;

        const c1 = b1 >> 2;
        const c2 = ((b1 & 3) << 4) | (b2 >> 4);
        const c3 = ((b2 & 15) << 2) | (b3 >> 6);
        const c4 = b3 & 63;

        r += B64_MAP.charAt(c1);
        r += B64_MAP.charAt(c2);
        if (i + 1 < data.length) {
            r += B64_MAP.charAt(c3);
        }
        if (i + 2 < data.length) {
            r += B64_MAP.charAt(c4);
        }
    }
    return r;
}

async function getPlantUmlImageUrl(plantUmlCode: string): Promise<string> {
    const compressed = deflateSync(Buffer.from(plantUmlCode, 'utf-8'));
    const encoded = encode64(compressed);
    const plantUmlUrl = `https://www.plantuml.com/plantuml/png/~1${encoded}`;
    return `/api/proxy-image?url=${encodeURIComponent(plantUmlUrl)}`;
}

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        // التحقق من نوع الطلب
        if (data.intent === 'update_diagram') {
            const imageUrl = await getPlantUmlImageUrl(data.plantUmlCode);
            return ApiResponse.success({
                plantUmlCode: data.plantUmlCode,
                imageUrl
            });
        }

        // توليد مخطط جديد
        const agentInput = data;
        const result = await generateDiagram(agentInput);
        const imageUrl = await getPlantUmlImageUrl(result.plantUmlCode);

        const finalOutput = {
            plantUmlCode: result.plantUmlCode,
            explanation: result.explanation,
            imageUrl: imageUrl,
        };

        // تسجيل العملية
        await logGeneration({
            agentId: `generate-${data.diagramToGenerate}-diagram`,
            userId: user.id,
            input: agentInput,
            output: finalOutput,
            creditCost: 1,
        });

        return ApiResponse.success(finalOutput);
    } catch (error) {
        console.error('Generate diagram error:', error);
        return ApiResponse.error('Failed to generate diagram', 500);
    }
}, { validateBody: unifiedDiagramSchema, requireAuth: true });
