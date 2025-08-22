
'use server';

import { z } from 'zod';
import { generateReportSection } from '@/ai/flows/generate-report-section';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, ProjectPlanSchema, ExternalContextSchema } from '@/ai/schemas';

const SectionGenerationConfigSchema = z.object({
  section: SectionNameSchema,
  context: z.object({
    sections: z.array(SectionNameSchema).optional(),
    diagrams: z.array(DiagramTypeSchema).optional(),
  }),
  guidelines: z.array(z.string()),
  instructions: z.object({
    tone: z.enum(['professional', 'academic', 'casual', 'persuasive', 'none']),
    formality: z.enum(['informal', 'balanced', 'very formal']),
  }),
});

const generateFullReportSchema = z.object({
  proposal: ProjectProposalSchema.optional().nullable(),
  projectPlan: ProjectPlanSchema.optional().nullable(),
  existingSections: z.record(SectionNameSchema, z.string()).optional(),
  existingDiagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  externalContext: z.array(ExternalContextSchema).optional(),
  generationPlan: z.array(SectionGenerationConfigSchema),
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = generateFullReportSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { proposal, projectPlan, existingSections, existingDiagrams, externalContext, generationPlan } = validation.data;
    const creditCost = generationPlan.length;

    if (creditCost > 0) {
      await deductCredit(user.id, creditCost);
    }

    const generatedSections: { [key in z.infer<typeof SectionNameSchema>]?: string } = {};

    for (const config of generationPlan) {
      const sectionKey = config.section;
      const contextSections = config.context.sections?.reduce((acc, key) => {
        const content = existingSections?.[key] || generatedSections[key];
        if (content) {
          acc[key] = content;
        }
        return acc;
      }, {} as Record<string, string>) || {};

      const contextDiagrams = config.context.diagrams?.reduce((acc, key) => {
        if (existingDiagrams?.[key]) {
          acc[key] = existingDiagrams[key];
        }
        return acc;
      }, {} as Record<string, string>) || {};

      const agentInput = {
        proposal,
        projectPlan,
        sectionToGenerate: sectionKey,
        otherSections: contextSections,
        otherDiagrams: contextDiagrams,
        externalContext,
        guidelines: config.guidelines,
        instructionText: `- The writing style should be ${config.instructions.formality}.\n- Adopt a ${config.instructions.tone} tone.`,
      };

      const result = await generateReportSection(agentInput);
      generatedSections[result.sectionName] = result.content;

      await logGeneration({
        agentId: `generate-${result.sectionName}-section`,
        userId: user.id,
        input: { summary: `Generated as part of full report for project: ${proposal?.title}` },
        output: { summary: `Content length: ${result.content.length}` },
        creditCost: 1, // Log cost per section
      });
    }

    return createApiResponse(generatedSections, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
