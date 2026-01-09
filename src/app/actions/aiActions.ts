

'use server';

import {
  academicLiteratureReview,
  academicPaperQualityChecker,
  professionalDocumentWriter,
} from '@/ai/flows';
import {
  aiResearcher,
  grammarCheck,
  paraphraseText,
  summarizeText,
  translateText,
} from '@/ai/flows';
import { ollamaTestFlow } from '@/ai/flows/ollama-example';

// Import schemas for tools from their correct location
import {
  AnalyzeArgumentStructureToolInputSchema,
  AnalyzeDocumentQualityToolInputSchema,
  AnalyzeDocumentStructureToolInputSchema,
  AnalyzeToneToolInputSchema,
  CheckGrammarToolInputSchema,
  CheckLogicalFlowToolInputSchema,
  CheckReadabilityToolInputSchema,
  CheckReferencesToolInputSchema,
  ImproveWordChoiceToolInputSchema,
  MatchCitationsToReferencesToolInputSchema,
  ValidateCitationsToolInputSchema,
  AcademicPaperQualityCheckerInputSchema,
  ProfessionalDocumentWriterInputSchema,
  AcademicLiteratureReviewInputSchema,
} from '@/ai/tools/schemas';

import { logGeneration } from './analyticsActions';
import { deductCredit } from './userActions';
import { requireUser } from './_utils/auth';
import { z } from 'zod';
// Corrected import: Changed to executeFlow and kept the alias
import { executeFlow as runUniveralWritingTool } from '@/ai/flows';

const OllamaTestInputSchema = z.object({
  prompt: z.string().min(1),
});

const toolConfig = {
  // Professional Writing Tools
  checkGrammar: { flow: runUniveralWritingTool, schema: CheckGrammarToolInputSchema, creditCost: 1 },
  analyzeTone: { flow: runUniveralWritingTool, schema: AnalyzeToneToolInputSchema, creditCost: 1 },
  checkReadability: { flow: runUniveralWritingTool, schema: CheckReadabilityToolInputSchema, creditCost: 1 },
  improveWordChoice: { flow: runUniveralWritingTool, schema: ImproveWordChoiceToolInputSchema, creditCost: 1 },
  analyzeDocumentStructure: { flow: runUniveralWritingTool, schema: AnalyzeDocumentStructureToolInputSchema, creditCost: 2 },
  checkLogicalFlow: { flow: runUniveralWritingTool, schema: CheckLogicalFlowToolInputSchema, creditCost: 2 },
  analyzeArgumentStructure: { flow: runUniveralWritingTool, schema: AnalyzeArgumentStructureToolInputSchema, creditCost: 2 },
  validateCitations: { flow: runUniveralWritingTool, schema: ValidateCitationsToolInputSchema, creditCost: 1 },
  checkReferences: { flow: runUniveralWritingTool, schema: CheckReferencesToolInputSchema, creditCost: 1 },
  matchCitationsToReferences: { flow: runUniveralWritingTool, schema: MatchCitationsToReferencesToolInputSchema, creditCost: 2 },
  analyzeDocumentQuality: { flow: runUniveralWritingTool, schema: AnalyzeDocumentQualityToolInputSchema, creditCost: 5 },

  // Advanced Flows
  academicLiteratureReview: { flow: academicLiteratureReview, schema: AcademicLiteratureReviewInputSchema, creditCost: 10 },
  academicPaperQualityChecker: { flow: academicPaperQualityChecker, schema: AcademicPaperQualityCheckerInputSchema, creditCost: 8 },
  professionalDocumentWriter: { flow: professionalDocumentWriter, schema: ProfessionalDocumentWriterInputSchema, creditCost: 6 },
  
  // Other existing tools (now using universal flow)
  summarize: { flow: summarizeText, schema: z.any(), creditCost: 1 },
  paraphrase: { flow: paraphraseText, schema: z.any(), creditCost: 1 },
  translate: { flow: translateText, schema: z.any(), creditCost: 1 },
  'ai-researcher': { flow: aiResearcher, schema: z.any(), creditCost: 2 },
  'ollama-test': { flow: ollamaTestFlow, schema: OllamaTestInputSchema, creditCost: 0 },
  
} as const;

export type ToolName = keyof typeof toolConfig;

export async function runWritingToolAction(tool: ToolName, data: unknown) {
  const user = await requireUser();
  const config = toolConfig[tool];
  if (!config) {
    throw new Error(`Invalid tool: ${tool}`);
  }

  const serverData = { ...data };
  
  const validation = config.schema.safeParse(serverData);
  if (!validation.success) {
    throw validation.error;
  }

  const input = validation.data as any;
  await deductCredit(user.id, config.creditCost);

  // Corrected logic: The 'flow' property from the config is the function to call.
  // For universal flows, we pass the tool name as the first argument.
  const isUniversalTool = config.flow === runUniveralWritingTool;
  
  const result = isUniversalTool
    ? await runUniveralWritingTool(tool as any, input)
    : await (config.flow as any)(input);

  await logGeneration({
    agentId: tool,
    userId: user.id,
    input,
    output: result,
    creditCost: config.creditCost
  });

  return result;
}
