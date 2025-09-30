
'use server';

import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

// Import all flows and schemas
import { aiResearcher } from '@/ai/flows/ai-researcher';
import { detectAiContent } from '@/ai/flows/detect-ai-content';
import { factCheckText } from '@/ai/flows/fact-checker';
import { generateCitation } from '@/ai/flows/generate-citation';
import { generateIdeas } from '@/ai/flows/generate-ideas';
import { generatePlantUML } from '@/ai/flows/generate-plantuml';
import { generatePresentationOutline } from '@/ai/flows/generate-presentation-outline';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { humanizeText } from '@/ai/flows/humanize-text';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { plagiarismCheck } from '@/ai/flows/plagiarism-checker';
import { summarizeText } from '@/ai/flows/summarize-text';
import { rewriteText, summarizeTextWithRatio } from '@/ai/flows/text-stylist';
import { topicExplainer } from '@/ai/flows/topic-explainer';
import { writeDocument } from '@/ai/flows/write-document';
import { AIResearcherInputSchema, DetectAIInputSchema, FactCheckInputSchema, GenerateCitationInputSchema, GeneratePlantUMLInputSchema, GeneratePresentationOutlineInputSchema, GenerateQuizInputSchema, GrammarCheckInputSchema, HumanizeTextInputSchema, IdeaGenerationInputSchema, ManipulateTextInputSchema, ParaphraseInputSchema, PlagiarismCheckInputSchema, RewriteTextInputSchema, SummarizeInputSchema, SummarizeTextWithRatioInputSchema, TopicExplainerInputSchema, WriteDocumentInputSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
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
  'manipulate-text': { flow: manipulateText, schema: ManipulateTextInputSchema, creditCost: 1 },
};

type ToolName = keyof typeof toolConfig;

export const POST = withEnhancedAuth(async ({ request, user, params }) => {
  const toolName = params.tool as ToolName;

  const config = toolConfig[toolName];
  if (!config) {
    return handleApiErrorEnhanced({ message: `Invalid tool: ${toolName}` }, 400);
  }

  const { flow, schema, creditCost } = config;

  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
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

    return createApiResponseEnhanced(result, 200);

  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
