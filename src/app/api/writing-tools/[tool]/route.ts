'use server';

import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

// Import all flows and schemas
import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { ParaphraseInputSchema } from '@/ai/schemas';
import { summarizeText } from '@/ai/flows/summarize-text';
import { SummarizeInputSchema } from '@/ai/schemas';
import { humanizeText } from '@/ai/flows/humanize-text';
import { HumanizeTextInputSchema } from '@/ai/schemas';
import { detectAiContent } from '@/ai/flows/detect-ai-content';
import { DetectAIInputSchema } from '@/ai/schemas';
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { GrammarCheckInputSchema } from '@/ai/schemas';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { GenerateQuizInputSchema } from '@/ai/schemas';
import { factCheckText } from '@/ai/flows/fact-checker';
import { FactCheckInputSchema } from '@/ai/schemas';
import { plagiarismCheck } from '@/ai/flows/plagiarism-checker';
import { PlagiarismCheckInputSchema } from '@/ai/schemas';
import { generateCitation } from '@/ai/flows/generate-citation';
import { GenerateCitationInputSchema } from '@/ai/schemas';
import { aiResearcher } from '@/ai/flows/ai-researcher';
import { AIResearcherInputSchema } from '@/ai/schemas';
import { topicExplainer } from '@/ai/flows/topic-explainer';
import { TopicExplainerInputSchema } from '@/ai/schemas';
import { generateIdeas } from '@/ai/flows/generate-ideas';
import { IdeaGenerationInputSchema } from '@/ai/schemas';
import { writeDocument } from '@/ai/flows/write-document';
import { WriteDocumentInputSchema } from '@/ai/schemas';
import { generatePresentationOutline } from '@/ai/flows/generate-presentation-outline';
import { GeneratePresentationOutlineInputSchema } from '@/ai/schemas';
import { generatePlantUML } from '@/ai/flows/generate-plantuml';
import { GeneratePlantUMLInputSchema } from '@/ai/schemas';
import { rewriteText, summarizeTextWithRatio } from '@/ai/flows/text-stylist';
import { RewriteTextInputSchema, SummarizeTextWithRatioInputSchema } from '@/ai/schemas';

// Define a map for tool configurations
const toolConfig = {
  'paraphrase': { flow: paraphraseText, schema: ParaphraseInputSchema, creditCost: 1 },
  'summarize': { flow: summarizeText, schema: SummarizeInputSchema, creditCost: 1 },
  'humanize': { flow: humanizeText, schema: HumanizeTextInputSchema, creditCost: 1 },
  'ai-detector': { flow: detectAiContent, schema: DetectAIInputSchema, creditCost: 1 },
  'grammar-checker': { flow: grammarCheck, schema: GrammarCheckInputSchema, creditCost: 1 },
  'quiz-generator': { flow: generateQuiz, schema: GenerateQuizInputSchema, creditCost: 1 },
  'fact-checker': { flow: factCheckText, schema: FactCheckInputSchema, creditCost: 2 },
  'plagiarism-checker': { flow: plagiarismCheck, schema: PlagiarismCheckInputSchema, creditCost: 2 },
  'citation-generator': { flow: generateCitation, schema: GenerateCitationInputSchema, creditCost: 1 },
  'ai-researcher': { flow: aiResearcher, schema: AIResearcherInputSchema, creditCost: 2 },
  'topic-explainer': { flow: topicExplainer, schema: TopicExplainerInputSchema, creditCost: 1 },
  'generate-ideas': { flow: generateIdeas, schema: IdeaGenerationInputSchema, creditCost: 1 },
  'write-document': { flow: writeDocument, schema: WriteDocumentInputSchema, creditCost: 3 },
  'presentation-outline': { flow: generatePresentationOutline, schema: GeneratePresentationOutlineInputSchema, creditCost: 1 },
  'generate-plantuml': { flow: generatePlantUML, schema: GeneratePlantUMLInputSchema, creditCost: 1 },
  'rewrite-text': { flow: rewriteText, schema: RewriteTextInputSchema, creditCost: 1 },
  'summarize-with-ratio': { flow: summarizeTextWithRatio, schema: SummarizeTextWithRatioInputSchema, creditCost: 1 },
};

type ToolName = keyof typeof toolConfig;

export const POST = withAuth(async ({ request, user, params }) => {
  const toolName = params.tool as ToolName;

  const config = toolConfig[toolName];
  if (!config) {
    return handleApiError({ message: `Invalid tool: ${toolName}` }, 400);
  }

  const { flow, schema, creditCost } = config;

  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const result = await flow(validation.data as any);

    await deductCredit(user.id, creditCost);

    await logGeneration({
      agentId: toolName,
      userId: user.id,
      input: validation.data,
      output: result,
      creditCost: creditCost,
    });

    return createApiResponse(result, 200);

  } catch (error) {
    return handleApiError(error);
  }
});
