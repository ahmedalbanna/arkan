
'use server';

import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, ProjectPlanSchema } from '@/ai/schemas';
import { generateDiagram } from '@/ai/flows/generate-diagrams';
import { deflateSync } from 'zlib';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

// Schema for a new diagram generation request
const generateDiagramSchema = z.object({
  proposal: ProjectProposalSchema.optional().nullable(),
  projectPlan: ProjectPlanSchema.optional().nullable(),
  diagramToGenerate: DiagramTypeSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional(),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  externalContext: z.array(z.object({ fileName: z.string(), content: z.string() })).optional(),
  instructionText: z.string().optional(),
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

    // Deduct credit only after a successful generation
    await deductCredit(user.id, 1);

    const finalOutput = {
      plantUmlCode: result.plantUmlCode,
      imageUrl: imageUrl,
    };

    await logGeneration({
        agentId: `generate-${validation.data.diagramToGenerate}-diagram`,
        userId: user.id,
        input: agentInput,
        output: finalOutput,
    });

    return createApiResponse(finalOutput, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
