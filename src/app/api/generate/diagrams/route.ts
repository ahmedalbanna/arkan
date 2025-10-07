
'use server';

import { generateDiagram } from '@/ai/flows/generate-diagrams';
import { DiagramTypeSchema, ExternalContextSchema, ProjectPlanSchema, ProjectProposalSchema, SectionNameSchema } from '@/ai/schemas';
import { createApiResponse, handleApiError, withAuth } from '@/lib/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { deflateSync } from 'zlib';
import { z } from 'zod';

// Schema for a new diagram generation request
const generateDiagramSchema = z.object({
  proposal: ProjectProposalSchema.optional().nullable(),
  projectPlan: ProjectPlanSchema.optional().nullable(),
  diagramToGenerate: DiagramTypeSchema.describe("The type of diagram to generate."),
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  externalContext: z.array(ExternalContextSchema).optional().describe("An array of external documents (text or data URIs) provided by the user."),
  instructionText: z.string().optional().describe("Additional instructions for generation (e.g., tone, formality)."),
}).refine(data => {
  // التحقق من وجود السياق المطلوب لتوليد الرسم البياني
  return data.proposal ||
    data.projectPlan ||
    (data.otherSections && Object.keys(data.otherSections).length > 0) ||
    (data.otherDiagrams && Object.keys(data.otherDiagrams).length > 0) ||
    (data.externalContext && data.externalContext.length > 0);
}, {
  message: "Either proposal, projectPlan, otherSections, otherDiagrams, or externalContext is required to generate a diagram",
  path: ["proposal"]
});

// Helper function to encode PlantUML for URL
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

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();

    if (body.intent === 'update_diagram') {
      if (!body.plantUmlCode) {
        return handleApiError({ message: 'PlantUML code is required for an update.' }, 400);
      }
      const imageUrl = await getPlantUmlImageUrl(body.plantUmlCode);
      return createApiResponse({ plantUmlCode: body.plantUmlCode, imageUrl }, 200);
    }

    const validation = generateDiagramSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const agentInput = validation.data;
    const result = await generateDiagram(agentInput);
    const imageUrl = await getPlantUmlImageUrl(result.plantUmlCode);

    const creditCost = 1;
    await deductCredit(user.id, creditCost);

    const finalOutput = {
      plantUmlCode: result.plantUmlCode,
      imageUrl: imageUrl,
    };

    await logGeneration({
      agentId: `generate-${validation.data.diagramToGenerate}-diagram`,
      userId: user.id,
      input: agentInput,
      output: finalOutput,
      creditCost: creditCost,
    });

    return createApiResponse(finalOutput, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
