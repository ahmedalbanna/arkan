
'use server';

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

// Import all flows and schemas
import { aiResearcher } from '@/ai/flows/ai-researcher';
import { biasCheckText } from '@/ai/flows/bias-checker';
import { generateChapterContent } from '@/ai/flows/generate-chapter-content';
import { detectAiContent } from '@/ai/flows/detect-ai-content';
import { factCheckText } from '@/ai/flows/fact-checker';
import { retrieveFact } from '@/ai/flows/fact-retrieval';
import { generateCitation } from '@/ai/flows/generate-citation';
import { generateIdeas } from '@/ai/flows/generate-ideas';
import { generatePlantUML } from '@/ai/flows/generate-plantuml';
import { generateProjectBlueprint } from '@/ai/flows/generate-project-blueprint';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import { generateToc } from '@/ai/flows/generate-toc';
import { generateUiDescription } from '@/ai/flows/generate-ui-description';
import { grammarCheck } from '@/ai/flows/grammar-checker';
import { humanizeText } from '@/ai/flows/humanize-text';
import { generateLiteratureReview } from '@/ai/flows/literature-review-generator';
import { manipulateText } from '@/ai/flows/manipulate-text';
import { paraphraseText } from '@/ai/flows/paraphrase-text';
import { plagiarismCheck } from '@/ai/flows/plagiarism-checker';
import { answerQuestion } from '@/ai/flows/question-answering';
import { sentenceStructureCheck } from '@/ai/flows/sentence-structure-checker';
import { solveAssignments } from '@/ai/flows/solve-assignments';
import { summarizeText } from '@/ai/flows/summarize-text';
import { clarityAdvisor, concisenessChecker, readabilityEnhancer, rewriteText, styleEditor, summarizeTextWithRatio } from '@/ai/flows/text-stylist';
import { topicExplainer } from '@/ai/flows/topic-explainer';
import { translateText } from '@/ai/flows/translate-text';
import { writeDocument } from '@/ai/flows/write-document';
import { AIResearcherInputSchema, BiasCheckInputSchema, ClarityAdvisorInputSchema, ConcisenessCheckerInputSchema, DetectAIInputSchema, FactCheckInputSchema, FactRetrievalInputSchema, GenerateCitationInputSchema, GeneratePlantUMLInputSchema, GenerateProjectBlueprintInputSchema, GenerateQuizInputSchema, GenerateTocInputSchema, GenerateUIDescriptionInputSchema, GrammarCheckInputSchema, HumanizeTextInputSchema, IdeaGenerationInputSchema, LiteratureReviewInputSchema, ManipulateTextInputSchema, ParaphraseInputSchema, ParaphraseModeSchema, PlagiarismCheckInputSchema, QuestionAnsweringInputSchema, ReadabilityEnhancerInputSchema, RewriteTextInputSchema, SentenceStructureCheckInputSchema, SolveAssignmentsInputSchema, StyleEditorInputSchema, SummarizeInputSchema, SummarizeTextWithRatioInputSchema, TopicExplainerInputSchema, TranslateTextInputSchema, WriteDocumentInputSchema, GenerateChapterInputSchema } from '@/ai/schemas';
import { z } from 'zod';
import { configureUserAi } from '@/ai/genkit';
import { generateImage } from '@/ai/flows/generate-image';

// Define a map for tool configurations
const toolConfig = {
  'paraphrase': { flow: paraphraseText, schema: ParaphraseInputSchema.pick({ text: true, mode: true }), creditCost: 1 },
  'summarize': { flow: summarizeText, schema: SummarizeInputSchema.pick({ text: true, length: true }), creditCost: 1 },
  'humanize': { flow: humanizeText, schema: HumanizeTextInputSchema.pick({ text: true }), creditCost: 1 },
  'ai-detector': { flow: detectAiContent, schema: DetectAIInputSchema.pick({ text: true }), creditCost: 1 },
  'grammar-checker': { flow: grammarCheck, schema: GrammarCheckInputSchema.pick({ text: true }), creditCost: 1 },
  'quiz-generator': { flow: generateQuiz, schema: GenerateQuizInputSchema.pick({ text: true, numQuestions: true, questionType: true }), creditCost: 1 },
  'fact-checker': { flow: factCheckText, schema: FactCheckInputSchema.pick({ text: true }), creditCost: 2 },
  'plagiarism-checker': { flow: plagiarismCheck, schema: PlagiarismCheckInputSchema.pick({ text: true }), creditCost: 2 },
  'citation-generator': { flow: generateCitation, schema: GenerateCitationInputSchema.pick({ sourceText: true, style: true }), creditCost: 1 },
  'ai-researcher': { flow: aiResearcher, schema: AIResearcherInputSchema.pick({ topic: true, depth: true }), creditCost: 2 },
  'literature-review': { flow: generateLiteratureReview, schema: LiteratureReviewInputSchema.pick({ topic: true, focusAreas: true, numberOfSources: true, timeRange: true }), creditCost: 3 },
  'question-answering': { flow: answerQuestion, schema: QuestionAnsweringInputSchema.pick({ question: true, context: true, useWebSearch: true, maxSources: true }), creditCost: 1 },
  'fact-retrieval': { flow: retrieveFact, schema: FactRetrievalInputSchema.pick({ factQuery: true, useWebSearch: true, requireSource: true }), creditCost: 1 },
  'topic-explainer': { flow: topicExplainer, schema: TopicExplainerInputSchema.pick({ topic: true }), creditCost: 1 },
  'generate-ideas': { flow: generateIdeas, schema: IdeaGenerationInputSchema.pick({ specialization: true, domain: true, region: true, circumstances: true, additionalContext: true }), creditCost: 1 },
  'write-document': { flow: writeDocument, schema: WriteDocumentInputSchema.pick({ topic: true, documentType: true, knowledge: true, tableOfContents: true }), creditCost: 3 },
  'generate-plantuml': { flow: generatePlantUML, schema: GeneratePlantUMLInputSchema.pick({ description: true, diagramType: true }), creditCost: 1 },
  'rewrite-text': { flow: rewriteText, schema: RewriteTextInputSchema.pick({ text: true, style: true }), creditCost: 1 },
  'summarize-with-ratio': { flow: summarizeTextWithRatio, schema: SummarizeTextWithRatioInputSchema.pick({ text: true, ratio: true }), creditCost: 1 },
  'style-editor': { flow: styleEditor, schema: StyleEditorInputSchema.pick({ text: true, targetAudience: true, tone: true }), creditCost: 1 },
  'readability-enhancer': { flow: readabilityEnhancer, schema: ReadabilityEnhancerInputSchema.pick({ text: true, targetLevel: true }), creditCost: 1 },
  'conciseness-checker': { flow: concisenessChecker, schema: ConcisenessCheckerInputSchema.pick({ text: true, targetReduction: true }), creditCost: 1 },
  'clarity-advisor': { flow: clarityAdvisor, schema: ClarityAdvisorInputSchema.pick({ text: true, focusAreas: true }), creditCost: 1 },
  'manipulate-text': { flow: manipulateText, schema: ManipulateTextInputSchema.pick({ textToManipulate: true, command: true }), creditCost: 1 },
  'generate-toc': { flow: generateToc, schema: GenerateTocInputSchema.pick({ projectDescription: true }), creditCost: 1 },
  'translate-text': { flow: translateText, schema: TranslateTextInputSchema.pick({ text: true, targetLang: true }), creditCost: 1 },
  'bias-checker': { flow: biasCheckText, schema: BiasCheckInputSchema.pick({ text: true }), creditCost: 1 },
  'sentence-structure-checker': { flow: sentenceStructureCheck, schema: SentenceStructureCheckInputSchema.pick({ text: true }), creditCost: 1 },
  'solve-assignments': { flow: solveAssignments, schema: SolveAssignmentsInputSchema.pick({ text: true }), creditCost: 2 },
  'project-blueprint': { flow: generateProjectBlueprint, schema: GenerateProjectBlueprintInputSchema.omit({ flow: true }), creditCost: 3 },
  'generate-ui-description': { flow: generateUiDescription, schema: GenerateUIDescriptionInputSchema.omit({ flow: true }), creditCost: 2 },
  'generate-chapter': { flow: generateChapterContent, schema: GenerateChapterInputSchema.omit({ flow: true }), creditCost: 2 },
  'generate-project-from-full-prompt': { 
    flow: (data: { fullPrompt: string }, userApiKeys?: Record<string, string>) => {
      const ai = configureUserAi(userApiKeys);
      return ai.generate({ model: 'googleai/gemini-2.5-flash-lite', prompt: data.fullPrompt });
    },
    schema: z.object({ fullPrompt: z.string() }),
    creditCost: 5, // Higher cost for a full project build
  },
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
    
    // Hardcoded response for testing is removed, now calling the actual flow.
    await deductCredit(user.id, creditCost);
    const result = await (flow as any)(validation.data, user.apiKeys);

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
