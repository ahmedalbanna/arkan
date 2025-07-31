
'use server';

import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, type SectionName, DiagramType, ProjectPlanSchema } from '@/ai/schemas';
import { generateReportSection } from '@/ai/flows/generate-report-section';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { sectionConfig } from '@/lib/report-config';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';


// This API now only handles SINGLE section generation.
// The "full report" generation is orchestrated on the client-side.
const generateSectionSchema = z.object({
  proposal: ProjectProposalSchema.optional(),
  projectPlan: ProjectPlanSchema.optional().nullable(),
  sectionToGenerate: SectionNameSchema,
  otherSections: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => SectionNameSchema.safeParse(key).success);
  }, "All keys must be a valid SectionName").optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => DiagramTypeSchema.safeParse(key).success);
  }, "All keys must be a valid DiagramType").optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  exampleFiles: z.array(z.object({ fileName: z.string(), content: z.string(), type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']) })).optional().describe("An array of example documents to be used for style, tone, and structure."),
  contextFiles: z.array(z.object({ fileName: z.string(), content: z.string(), type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']) })).optional().describe("An array of context documents to be used for factual information."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  instructionText: z.string().optional().describe("Additional specific instructions for the generation, derived from user controls like tone and formality."),
  tableOfContents: z.array(z.string()).optional().describe("The full table of contents for the report to give the agent context of the document structure."),
});


export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateSectionSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }
    
    await deductCredit(user.id, 1);
    const agentInput = validation.data;
    
    // A proposal, plan, or external context is required to generate a section.
    if (!agentInput.proposal && !agentInput.projectPlan && (!agentInput.exampleFiles || agentInput.exampleFiles.length === 0) && (!agentInput.contextFiles || agentInput.contextFiles.length === 0)) {
        return handleApiError({ message: "A proposal, project plan, or external context is required to report section." }, 400);
    }

    const agentInfo = sectionConfig[agentInput.sectionToGenerate];

    if (!agentInfo) {
        return handleApiError({ message: 'Unknown section requested.' }, 400);
    }
    
    const result = await generateReportSection(agentInput);

    const transformedOutput = { [result.sectionName]: result.content };
    
    await logGeneration({ 
        agentId: agentInfo.agentId, 
        userId: user.id, 
        input: agentInput, 
        output: transformedOutput 
    });

    return createApiResponse(transformedOutput, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
